import { SQSEvent } from "aws-lambda";

export const formatStreamData = async (
  event: SQSEvent
): Promise<streamResponse> => {
  const { Records } = event;

  const { body } = Records[0];

  const dynamodb = JSON.parse(body);

  console.log(`Stream data is: `, dynamodb);

  const repositoryName = dynamodb?.NewImage?.repositoryName
    ? dynamodb?.NewImage?.repositoryName.S
    : ("" as string);

  const streamEvent = dynamodb?.NewImage?.eventName
    ? dynamodb?.NewImage?.eventName.S
    : ("" as string);

  const organisationName = dynamodb?.NewImage?.organisationName
    ? dynamodb?.NewImage?.organisationName.S
    : ("" as string);

  const alertCreatedAtFullTimestamp = dynamodb?.NewImage
    ?.alertCreatedAtFullTimestamp
    ? dynamodb?.NewImage?.alertCreatedAtFullTimestamp.S
    : ("" as string);

  const alertClosedAtFullTimestamp = dynamodb?.NewImage
    ?.alertClosedAtFullTimestamp
    ? dynamodb?.NewImage?.alertClosedAtFullTimestamp.S
    : ("" as string);

  const alertClosedAtReason = dynamodb?.NewImage?.alertClosedAtReason
    ? dynamodb?.NewImage?.alertClosedAtReason.S
    : ("" as string);

  const formattedStream = {
    repositoryName,
    organisationName,
    alertCreatedAtFullTimestamp,
    alertClosedAtFullTimestamp,
    alertClosedAtReason,
  } as parsedStream;

  return [streamEvent, formattedStream] as streamResponse;
};
