import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as EventbridgeNoMatchRule from '../lib/eventbridge-no-match-rule-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new EventbridgeNoMatchRule.EventbridgeNoMatchRuleStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
