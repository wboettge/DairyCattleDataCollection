#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { DairyCattleDataCollectionStack } from '../lib/dairy_cattle_data_collection-stack';
import { AwsIotRpiFleetProvisioningStack } from '../lib/aws-iot-rpi-fleet-provisioning-stack';

const app = new cdk.App();
new DairyCattleDataCollectionStack(app, 'DairyCattleDataCollectionStack', {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});

new AwsIotRpiFleetProvisioningStack(app, 'AwsIotRpiFleetProvisioningStack', {
  // wifiPasswordSecretName: CONFIG.wifiPasswordSecretName,
  sshPublicKey: CONFIG.sshPublicKey,
  wifiCountry: CONFIG.wifiCountry,
  wifiSsid: CONFIG.wifiSsid,
});