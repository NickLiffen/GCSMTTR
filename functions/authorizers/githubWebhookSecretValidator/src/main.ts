import { ssm } from "./ssm";
import { SQSEvent, APIGatewayProxyResultV2 } from "aws-lambda";
import { secretVerifier } from "./verify";

import { githubAuth } from "./getGitHubAppJWT";
import { checkIPs } from "./checkIPs";

import { getGitHubIpRange } from "./getIPs";

import { put } from "./eventBridge";

export const handler = async (
  event: SQSEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    console.log("event", event);

    const sqsBody = JSON.parse(event.Records[0].body);

    console.log("sqsBody", sqsBody);

    await ssm();

    /* GitHub IP Check */

    const token = (await githubAuth()) as string;
    const ips = (await getGitHubIpRange(token)) as hookIPAddress;
    const isAuthorized = (await checkIPs(ips, sqsBody.sourceIP)) as boolean;
    console.log(isAuthorized);

    if (!isAuthorized) {
      return {
        statusCode: 500,
        body: "unathorized IP",
      };
    }

    /* GitHub Secret Validator */

    const secretValidBool = (await secretVerifier(sqsBody)) as boolean;

    console.log(`Is secret valid: ${secretValidBool}`);

    if (!secretValidBool) {
      return {
        statusCode: 401,
        body: "Webhook secret provided does not match. unauthorized.",
      };
    }

    /* Send to event bridge */

    const errorCount = await put(sqsBody.body);

    console.log(
      `Was there an error in sending the message? (Yes if > 0): ${errorCount}`
    );

    if (errorCount > 0) {
      return {
        statusCode: 500,
        body: "Something went wrong. Please try again later.",
      };
    }

    return {
      statusCode: 200,
      body: "Success! Message sent to Step Functions State Machine",
    };
  } catch (e: any) {
    const body: string = e.body || "";
    console.error(e);
    return { statusCode: 401, body };
  }
};
