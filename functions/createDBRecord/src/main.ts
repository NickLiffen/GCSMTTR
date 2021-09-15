import { EventBridgeEvent } from "aws-lambda";
import delay from "delay";

import { CodeScanningAlertCreatedEvent } from "@octokit/webhooks-types";

export const handler = async (
  event: EventBridgeEvent<"transaction", CodeScanningAlertCreatedEvent>
): Promise<Response> => {
  console.log('whats going on one');
  await delay(1000);
  console.log('whats going on two');
  const {
    detail: { alert, repository, organization },
  } = event;
  console.log('whats going on three');
  const newDate = new Date(alert.created_at) as Date;
  console.log('whats going on four');
  const response = {
    record: {
      id: `${repository.full_name}/${alert.number}` as string,
      alertID: alert.number.toString() as string,
      alertURL: alert.html_url as string,
      alertCreatedAtFullTimestamp: alert.created_at as string,
      repositoryName: repository.name as string,
      organisationName: (organization
        ? organization.login
        : repository.owner.login) as string,
      alertCreatedAtYear: newDate.getUTCFullYear().toString() as string,
      alertCreatedAtMonth: newDate.getUTCMonth().toString() as string,
      alertCreatedAtDate: newDate.getUTCDate().toString() as string,
      alertClosedAtFullTimestamp: null,
    },
  } as Response;
  console.log('whats going on five');
  console.log(response);
  console.log('whats going on six');
  return response as Response;
};
