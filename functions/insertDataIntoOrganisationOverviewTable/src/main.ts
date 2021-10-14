import { SQSEvent } from "aws-lambda";

import {
  createDynamoID,
  getDynamoRecord,
  formatStreamData,
  formatDynamoRecord,
  formatDataToModifyEvent,
  runquery,
} from "./utils";

export const handler = async (event: SQSEvent): Promise<AWSResponse> => {
  try {
    let Detail = {} as Detail;

    console.log(Detail);

    const [streamEvent, formattedStream, e] = await formatStreamData(event);

    console.log(`The event coming from the DynamoDB Stream is: ${streamEvent}`);

    console.log(`What happened to the data was: ${e}`);

    console.log(
      `The formatted data coming from the DynamoDB Stream is:`,
      formattedStream
    );

    const [dynamoId, monthyPeriod] = await createDynamoID(formattedStream);

    console.log(`The created DynamoDB ID is: ${dynamoId}`);
    console.log(`The created monthly period is: ${monthyPeriod}`);

    const record = await getDynamoRecord(dynamoId);

    console.log(`The record coming from the DB is`, record);
    console.log(`The item coming from the DB is`, record.Item);

    const formattedRecord = await formatDynamoRecord(record);

    console.log(
      `The formatted data from the DynamoDB Record is:`,
      formattedRecord
    );

    const formatedModifiedData = formattedStream.newAlertTotalTimeToRemediate
      ? await formatDataToModifyEvent(formattedStream, formattedRecord, e)
      : ({} as formatDataToModifyEventResponse);

    console.log(
      `The formatted data from the modified event is:`,
      formatedModifiedData
    );

    if (
      (e === "ExistingOpenAlertAdded" || e === "NewOpenAlertCreated") &&
      !record.Item
    ) {
      Detail = {
        statusCode: 200,
        action: "INSERT-CREATE",
        id: `${dynamoId}`,
        organisationName: formattedStream.organisationName,
        reportingDate: monthyPeriod,
        openAlerts: "1",
      } as insertCreateResponseFormat;
    }

    if (
      (e === "ExistingOpenAlertAdded" || e === "NewOpenAlertCreated") &&
      record.Item
    ) {
      Detail = {
        statusCode: 200,
        action: "INSERT-UPDATE",
        id: `${dynamoId}`,
        openAlerts: (formattedRecord.openAlerts + 1).toString() as string,
      } as insertUpdateResponseFormat;
    }

    if (
      (e === "ExistingOpenAlertClosed" ||
        e === "ExistingOpenAlertFixed" ||
        e === "NewOpenAlertClosed" ||
        e === "NewOpenAlertFixed") &&
      !record.Item
    ) {
      Detail = {
        statusCode: 200,
        action: "MODIFY-CREATE",
        id: `${dynamoId}`,
        organisationName: formattedStream.organisationName,
        reportingDate: monthyPeriod,
        openAlerts: formatedModifiedData.openAlerts as string,
        numberFixed: formatedModifiedData.fixedAlerts as string,
        numberManuallyCosed: formatedModifiedData.closedAlerts as string,
        totalTimeToRemediate:
          formatedModifiedData.totalTimeToRemediate as string,
        meanTimeToRemediate: formatedModifiedData.meanTimeToRemediate as string,
      } as modifyCreateResponseFormat;
    }

    if (
      (e === "ExistingOpenAlertClosed" ||
        e === "ExistingOpenAlertFixed" ||
        e === "NewOpenAlertClosed" ||
        e === "NewOpenAlertFixed") &&
      record.Item
    ) {
      Detail = {
        statusCode: 200,
        action: "MODIFY-UPDATE",
        id: `${dynamoId}`,
        openAlerts: formatedModifiedData.openAlerts as string,
        numberFixed: formatedModifiedData.fixedAlerts as string,
        numberManuallyCosed: formatedModifiedData.closedAlerts as string,
        totalTimeToRemediate:
          formatedModifiedData.totalTimeToRemediate as string,
        meanTimeToRemediate: formatedModifiedData.meanTimeToRemediate as string,
      } as modifyUpdateResponseFormat;
    }

    await runquery(Detail);

    console.log("Data Put/Updated In DynamoDB");

    return { statusCode: 200, body: "success" };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
