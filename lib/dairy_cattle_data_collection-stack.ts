import * as path from 'path';
import * as cdk from '@aws-cdk/core';
import * as cfninc from '@aws-cdk/cloudformation-include';
import * as timestream from '@aws-cdk/aws-timestream';
import * as iot from '@aws-cdk/aws-iot';
import * as actions from '@aws-cdk/aws-iot-actions';


export class DairyCattleDataCollectionStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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

    const timestreamRuleAction = new cfninc.CfnInclude(this, 'Template', { 
      templateFile: path.join(__dirname, 'PipelineStack.yaml'),
      parameters: {
        'TimeStreamTableARN': cfnTable.attrArn
      }
    });


  }
}