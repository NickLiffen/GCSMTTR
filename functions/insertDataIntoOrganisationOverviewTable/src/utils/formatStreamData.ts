import { SQSEvent } from "aws-lambda";

export const formatStreamData = async (
  event: SQSEvent
): Promise<streamResponse> => {
  const { Records } = event;

  const { body } = Records[0];

  const { NewImage, OldImage, EventName } = JSON.parse(body) as sqsRecord;

  console.log("NewImage", NewImage);
  console.log("OldImage", OldImage);

  const repositoryName = NewImage.repositoryName
    ? NewImage.repositoryName.S
    : ("" as string);

  const organisationName = NewImage.organisationName
    ? NewImage.organisationName.S
    : ("" as string);

  const alertCreatedAtFullTimestamp = NewImage.alertCreatedAtFullTimestamp
    ? NewImage.alertCreatedAtFullTimestamp.S
    : ("" as string);

  const alertClosedAtFullTimestamp = NewImage.alertClosedAtFullTimestamp
    ? NewImage.alertClosedAtFullTimestamp.S
    : ("" as string);

  const alertClosedAtReason = NewImage.alertClosedAtReason
    ? NewImage.alertClosedAtReason.S
    : ("" as string);

  const streamEvent = EventName ? EventName : ("" as string);

  const formattedStream = {
    repositoryName,
    organisationName,
    alertCreatedAtFullTimestamp,
    alertClosedAtFullTimestamp,
    alertClosedAtReason,
  } as parsedStream;

  return [streamEvent, formattedStream] as streamResponse;
};
