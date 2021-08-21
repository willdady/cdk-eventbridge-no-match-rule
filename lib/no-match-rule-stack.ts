import * as cdk from '@aws-cdk/core';
import * as events from '@aws-cdk/aws-events';
import * as eventsTargets from '@aws-cdk/aws-events-targets';
import * as sqs from '@aws-cdk/aws-sqs';

import { NoMatchRule } from './no-match-rule';

export class NoMatchRuleStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const eventBus = new events.EventBus(this, 'EventBus');

    const queue1 = new sqs.Queue(this, 'Queue1');
    new events.Rule(this, 'Rule1', {
      eventBus: eventBus,
      eventPattern: { source: ['foo'] },
      targets: [new eventsTargets.SqsQueue(queue1)],
    });

    const queue2 = new sqs.Queue(this, 'Queue2');
    new events.Rule(this, 'Rule2', {
      eventBus: eventBus,
      eventPattern: { source: ['bar'] },
      targets: [new eventsTargets.SqsQueue(queue2)],
    });

    const noMatchQueue = new sqs.Queue(this, 'NoMatchQueue');

    new NoMatchRule(this, 'NoMatchRule', {
      eventBus: eventBus,
      queue: noMatchQueue,
    });
  }
}
