import {
  CloudWatchEventsClient,
  ListRulesCommand,
  TestEventPatternCommand,
} from '@aws-sdk/client-cloudwatch-events';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const { EVENT_BUS_ARN, SOURCE_RULE_NAME, QUEUE_URL } = process.env;

const eventsClient = new CloudWatchEventsClient({});
const sqsClient = new SQSClient({});

export const handler = async (event: any) => {
  let isFirstIteration = true;
  let nextToken: string | undefined;
  while (isFirstIteration || nextToken) {
    isFirstIteration = false;
    const response = await eventsClient.send(
      new ListRulesCommand({
        EventBusName: EVENT_BUS_ARN!,
        NextToken: nextToken,
        Limit: 100,
      })
    );
    nextToken = response.NextToken;
    for (const rule of response.Rules || []) {
      // We ignore the rule targeting this Lambda function
      if (rule.Name === SOURCE_RULE_NAME!) continue;
      // Check if rule matches event
      const response = await eventsClient.send(
        new TestEventPatternCommand({
          Event: JSON.stringify(event),
          EventPattern: rule.EventPattern,
        })
      );
      if (response.Result) {
        console.log(`Rule ${rule.Arn} matched the event`);
        return;
      }
    }
  }
  // If we make it here, no rules match the event
  console.log(`No rules matched event. Forwarding event to queue.`);
  await sqsClient.send(
    new SendMessageCommand({
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify(event),
    })
  );
};
