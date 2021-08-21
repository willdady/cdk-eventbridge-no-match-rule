import * as cdk from '@aws-cdk/core';
import * as events from '@aws-cdk/aws-events';
import * as eventsTargets from '@aws-cdk/aws-events-targets';
import * as lambdaNodejs from '@aws-cdk/aws-lambda-nodejs';
import * as lambda from '@aws-cdk/aws-lambda';
import * as iam from '@aws-cdk/aws-iam';
import * as sqs from '@aws-cdk/aws-sqs';

interface NoMatchRuleProps {
  eventBus: events.IEventBus;
  queue: sqs.IQueue;
}

export class NoMatchRule extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: NoMatchRuleProps) {
    super(scope, id);

    const func = new lambdaNodejs.NodejsFunction(this, 'func', {
      runtime: lambda.Runtime.NODEJS_14_X,
      memorySize: 256,
      environment: {
        EVENT_BUS_ARN: props.eventBus.eventBusArn,
        QUEUE_URL: props.queue.queueUrl,
      },
    });
    func.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['events:ListRules', 'events:TestEventPattern'],
        resources: ['*'],
      })
    );
    props.queue.grantSendMessages(func);

    const ruleName = `${id}CatchAllRule`;
    new events.Rule(this, 'Rule', {
      ruleName: ruleName,
      eventBus: props.eventBus,
      eventPattern: { source: [JSON.stringify({ prefix: '' })] },
      targets: [new eventsTargets.LambdaFunction(func)],
    });

    func.addEnvironment('SOURCE_RULE_NAME', ruleName);
  }
}
