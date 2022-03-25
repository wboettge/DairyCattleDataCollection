import * as path from 'path';

import * as cdk from 'aws-cdk-lib';
import * as cfninc from 'aws-cdk-lib/cloudformation-include';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as iot from 'aws-cdk-lib/aws-iot';
import * as timestream from 'aws-cdk-lib/aws-timestream';

import { Construct } from 'constructs';
import {readFileSync} from 'fs';


export class DairyCattleDataCollectionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a TimeStream Database and table to store sensor data
    const cfnDatabase = new timestream.CfnDatabase(this, 'TimeStreamDatabase', {
      databaseName: 'CFTestDB',
    });

    const cfnTable = new timestream.CfnTable(this, 'TimeStreamTable', {
      databaseName: 'CFTestDB',
      retentionProperties: {
        'MemoryStoreRetentionPeriodInHours': '24',
        'MagneticStoreRetentionPeriodInDays': '7'
      },
      tableName: 'CFTestTable'
    });

    // No cdk support yet for IoT topic rule actions. Therefore the resource
    // and IAM role is defined in a CloudFormation configuration file
    // TODO cdk support now exists, so use the constructs instead of the CFN
    /*const timestreamRuleAction = new cfninc.CfnInclude(this, 'Template', { 
      templateFile: path.join(__dirname, 'iot_rule_action.yaml'),
      parameters: {
        'TimeStreamTableARN': cfnTable.attrArn
      }
    }); */

    const cfnTopicRule = new iot.CfnTopicRule(this, 'CFTestRule', {
  topicRulePayload: {
    actions: [{            
      timestream: {
        databaseName: 'CFTestDB',
        dimensions: [{
          name: 'Device_ID',
          value: '${Device_ID}',
        }],
        roleArn: '!GetAtt IoTRuleTimeStreamAccessRole.Arn',
        tableName: 'CFTestTable',
      },
    }],
    sql: '!Sub |',

    // the properties below are optional
    awsIotSqlVersion: '2015-10-08',
    description: 'Sends IoT device data to a TimeStream database',
    ruleDisabled: false,
  },

});
//ENDS HERE

    // Define an EC2 instance
    const vpc = new ec2.Vpc(this, 'VPC', {
      subnetConfiguration: [{
        name: "public-subnet",
        subnetType: ec2.SubnetType.PUBLIC
      }]
    });
    const mySecurityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
      vpc,
      description: 'Allow ssh and Grafana access to ec2 instance',
      allowAllOutbound: true
    });
    mySecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'allow ssh access from anywhere');
    mySecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(3000), 'allow Grafana access from anywhere');

    const timestreamAccessRole = new iam.Role(this, 'TimestreamAccessRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonTimestreamFullAccess'),
      ],
    });

    const ec2Instance = new ec2.Instance(this, 'grafana-instance', {
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      role: timestreamAccessRole,
      securityGroup: mySecurityGroup,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO,
      ),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      keyName: 'AWS', // TODO create our own keys
      init: ec2.CloudFormationInit.fromElements(
        ec2.InitFile.fromFileInline('/etc/grafana/provisioning/dashboards/dashboards.yaml', './lib/Grafana/dashboards.yaml'),
        ec2.InitFile.fromFileInline('/etc/grafana/provisioning/datasources/datasources.yaml', './lib/Grafana/datasources.yaml'),
        ec2.InitFile.fromFileInline('/var/lib/grafana/dashboards/temperatureDash.json', './lib/Grafana/temperatureDash.json')
      ),
    });

    const userDataScript = readFileSync('./lib/EC2StartupCommands.sh', 'utf8');
    ec2Instance.addUserData(userDataScript);
  }
}