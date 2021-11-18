import * as cdk from '@aws-cdk/core';
import * as cfninc from '@aws-cdk/cloudformation-include';

export class DairyCattleDataCollectionStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const template = new cfninc.CfnInclude(this, 'Template', { 
      templateFile: 'PipelineStack.yaml',
    });
  }
}