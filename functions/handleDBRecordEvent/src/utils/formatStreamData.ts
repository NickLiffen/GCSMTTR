import { DynamoDBStreamEvent } from "aws-lambda";

export const formatStreamData = async (
  event: DynamoDBStreamEvent
): Promise<streamResponse> => {
  const { Records } = event;

  const { eventName: streamEvent, dynamodb } = Records[0];

  const repositoryName = dynamodb?.NewImage?.repositoryName.S as string;
  const organisationName = dynamodb?.NewImage?.organisationName.S as string;
  const alertCreatedAtFullTimestamp = dynamodb?.NewImage
    ?.alertCreatedAtFullTimestamp.S as string;
  const alertClosedAtFullTimestamp = dynamodb?.NewImage
    ?.alertClosedAtFullTimestamp.S as string;
  const alertClosedAtReason = dynamodb?.NewImage?.alertClosedAtReason
    .S as string;

  const formattedStream = {
    repositoryName,
    organisationName,
    alertCreatedAtFullTimestamp,
    alertClosedAtFullTimestamp,
    alertClosedAtReason,
  } as parsedStream;

  return [streamEvent, formattedStream] as streamResponse;
};
