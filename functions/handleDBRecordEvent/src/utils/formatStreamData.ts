import { SQSEvent } from "aws-lambda";

export const formatStreamData = async (
  event: SQSEvent
): Promise<streamResponse> => {
  const { Records } = event;

  const { body } = Records[0];

  const dynamodb = JSON.parse(body) as sqsRecord;

  console.log(`Stream data is: `, dynamodb);

  const repositoryName = dynamodb.repositoryName
    ? dynamodb.repositoryName.S
    : ("" as string);

  const streamEvent = dynamodb.S
    ? dynamodb.S
    : ("" as string);

  const organisationName = dynamodb.organisationName
    ? dynamodb.organisationName.S
    : ("" as string);

  const alertCreatedAtFullTimestamp = dynamodb.alertCreatedAtFullTimestamp
    ? dynamodb.alertCreatedAtFullTimestamp.S
    : ("" as string);

  const alertClosedAtFullTimestamp = dynamodb.alertClosedAtFullTimestamp
    ? dynamodb.alertClosedAtFullTimestamp.S
    : ("" as string);

  const alertClosedAtReason = dynamodb.alertClosedAtReason
    ? dynamodb.alertClosedAtReason.S
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
