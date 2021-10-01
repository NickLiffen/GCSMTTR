import { SQSEvent } from "aws-lambda";

import {
  createDynamoID,
  getDynamoRecord,
  formatStreamData,
  formatDynamoRecord,
  formatDataToModifyEvent,
  runquery,
} from "./utils";

export const handler = async (event: SQSEvent): Promise<Response> => {
  try {
    let Detail = {} as Detail;

    const [streamEvent, formattedStream] = await formatStreamData(event);

    console.log(`The event coming from the DynamoDB Stream is: ${streamEvent}`);
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

    if (streamEvent === "INSERT" && !record.Item) {
      console.log("INSERT", "EMPTY RECORD");

      Detail = {
        statusCode: 200,
        action: "INSERT-CREATE",
        id: `${dynamoId}`,
        repositoryName: formattedStream.repositoryName,
        organizationName: formattedStream.organisationName,
        reportingDate: monthyPeriod,
        openAlerts: "1",
      } as insertCreateResponseFormat;

      console.log(
        `The following Deail object has been built within the INSERT-CREATE IF:`,
        Detail
      );
    }

    if (streamEvent === "INSERT" && record.Item) {
      console.log("INSERT", "RECORD");

      Detail = {
        statusCode: 200,
        action: "INSERT-UPDATE",
        id: `${dynamoId}`,
        openAlerts: (formattedRecord.openAlerts + 1).toString() as string,
      } as insertUpdateResponseFormat;

      console.log(
        `The following Deail object has been built within the INSERT-RECORD IF: `,
        Detail
      );
    }

    const d = await formatDataToModifyEvent(formattedStream, formattedRecord);

    if (streamEvent === "MODIFY" && !record.Item) {
      console.log("MODIFY", "EMPTY RECORD");

      Detail = {
        statusCode: 200,
        action: "MODIFY-CREATE" as string,
        id: `${dynamoId}` as string,
        repositoryName: formattedStream.repositoryName as string,
        organizationName: formattedStream.organisationName as string,
        reportingDate: monthyPeriod as string,
        openAlerts: "0" as string,
        numberFixed: d.fixedAlerts as string,
        numberManuallyCosed: d.closedAlerts as string,
        totalTimeToRemediate: d.totalTimeToRemediate as string,
        meanTimeToRemediate: d.meanTimeToRemediate as string,
      } as modifyCreateResponseFormat;

      console.log(
        `The following Deail object has been built within the MODIFT-CREATE IF: `,
        Detail
      );
    }

    if (streamEvent === "MODIFY" && record.Item) {
      console.log("MODIFY", "RECORD");

      Detail = {
        statusCode: 200,
        action: "MODIFY-UPDATE",
        id: `${dynamoId}`,
        openAlerts: d.openAlerts as string,
        numberFixed: d.fixedAlerts as string,
        numberManuallyCosed: d.closedAlerts as string,
        totalTimeToRemediate: d.totalTimeToRemediate as string,
        meanTimeToRemediate: d.meanTimeToRemediate as string,
      } as modifyUpdateResponseFormat;
      console.log(
        `The following Deail object has been built within the MODIFT-UPDATE IF: `,
        Detail
      );
    }

    await runquery(Detail);

    console.log("Data Put/Updated In DynamoDB");

    return { statusCode: 200, body: "success" };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
