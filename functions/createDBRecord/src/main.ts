import { EventBridgeEvent } from "aws-lambda";

import { CodeScanningAlertCreatedEvent } from "@octokit/webhooks-types";

export const handler =  (
  event: EventBridgeEvent<"transaction", CodeScanningAlertCreatedEvent>
): Response => {
  const { detail: { alert, repository, organization} } = event; 

  const newDate = new Date(alert.created_at) as Date;

  const response =  { 
    record: {
      id: `${repository.full_name}/${alert.number}` as string,
      alertID: alert.number as number,
      alertURL: alert.html_url as string,
      alertCreatedAtFullTimestamp: alert.created_at as string,
      repositoryName: repository.name as string,
      organisationName: (organization ? organization.login : repository.owner.login) as string,
      alertCreatedAtYear: newDate.getUTCFullYear() as number,
      alertCreatedAtMonth: newDate.getUTCMonth() as number,
      alertCreatedAtDate: newDate.getUTCDate() as number,
      alertClosedAtFullTimestamp: null,
    }
  } as Response

  return response as Response;
};
