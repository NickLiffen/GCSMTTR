import {
  DynamoDBClient,
  DynamoDBClientConfig,
  PutItemCommand,
  PutItemCommandInput,
  PutItemCommandOutput,
  UpdateItemCommand,
  UpdateItemCommandInput,
  UpdateItemCommandOutput,
} from "@aws-sdk/client-dynamodb";

const config = {
  region: process.env.REGION,
} as DynamoDBClientConfig;

export const insertCreate = async (
  data: insertCreateResponseFormat
): Promise<PutItemCommandInput> => {
  console.log("within insertCreate", data);
  return {
    TableName: process.env.TABLE_NAME,
    Item: {
      id: {
        S: data.id,
      },
      organisationName: {
        S: data.organisationName,
      },
      repositoryName: {
        S: data.repositoryName,
      },
      monthlyPeriod: {
        S: data.reportingDate,
      },
      openAlerts: {
        N: data.openAlerts,
      },
    },
  } as PutItemCommandInput;
};

export const modifyCreate = async (
  data: modifyCreateResponseFormat
): Promise<PutItemCommandInput> => {
  console.log("within modifyCreate", data);
  return {
    TableName: process.env.TABLE_NAME,
    Item: {
      id: {
        S: data.id,
      },
      organisationName: {
        S: data.organisationName,
      },
      repositoryName: {
        S: data.repositoryName,
      },
      monthlyPeriod: {
        S: data.reportingDate,
      },
      openAlerts: {
        N: data.openAlerts,
      },
      totalTimeToRemediate: {
        N: data.totalTimeToRemediate,
      },
      meanTimeToRemediate: {
        N: data.meanTimeToRemediate,
      },
      numberFixed: {
        N: data.numberFixed,
      },
      numberManuallyCosed: {
        N: data.numberManuallyCosed,
      },
    },
  } as PutItemCommandInput;
};

export const insertUpdate = async (
  data: insertUpdateResponseFormat
): Promise<UpdateItemCommandInput> => {
  console.log("within insertUpdate", data);
  return {
    TableName: process.env.TABLE_NAME,
    Key: {
      id: {
        S: data.id,
      },
    },
    UpdateExpression: "SET openAlerts = :openAlerts",
    ExpressionAttributeValues: {
      ":openAlerts": {
        N: data.openAlerts,
      },
    },
  } as UpdateItemCommandInput;
};

export const modifyUpdate = async (
  data: modifyUpdateResponseFormat
): Promise<UpdateItemCommandInput> => {
  console.log("within modifyUpdate", data);
  return {
    TableName: process.env.TABLE_NAME,
    Key: {
      id: {
        S: data.id,
      },
    },
    UpdateExpression:
      "SET openAlerts = :openAlerts, numberFixed = :numberFixed, numberManuallyCosed = :numberManuallyCosed, totalTimeToRemediate = :totalTimeToRemediate, meanTimeToRemediate = :meanTimeToRemediate",
    ExpressionAttributeValues: {
      ":openAlerts": {
        N: data.openAlerts,
      },
      ":numberFixed": {
        N: data.numberFixed,
      },
      ":numberManuallyCosed": {
        N: data.numberManuallyCosed,
      },
      ":totalTimeToRemediate": {
        N: data.totalTimeToRemediate,
      },
      ":meanTimeToRemediate": {
        N: data.meanTimeToRemediate,
      },
    },
  } as UpdateItemCommandInput;
};

export const runupdatequery = async (
  data: insertUpdateResponseFormat | modifyUpdateResponseFormat
): Promise<UpdateItemCommand> => {
  try {
    let input: UpdateItemCommandInput;

    if (data.action === "INSERT-UPDATE") {
      input = await insertUpdate(data as insertUpdateResponseFormat);
    } else {
      input = await modifyUpdate(data as modifyUpdateResponseFormat);
    }

    console.log("input", input);

    const command = new UpdateItemCommand(input);
    return command;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const runputquery = async (
  data: insertCreateResponseFormat | modifyCreateResponseFormat
): Promise<PutItemCommand> => {
  try {
    let input: PutItemCommandInput;

    if (data.action === "INSERT-CREATE") {
      input = await insertCreate(data as insertCreateResponseFormat);
    } else {
      input = await modifyCreate(data as modifyCreateResponseFormat);
    }

    console.log("input", input);

    const command = new PutItemCommand(input);
    return command;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
export const runquery = async (
  data:
    | insertCreateResponseFormat
    | insertUpdateResponseFormat
    | modifyCreateResponseFormat
    | modifyUpdateResponseFormat
): Promise<UpdateItemCommandOutput> => {
  try {
    let command: UpdateItemCommand | PutItemCommand;

    switch (data.action) {
      case "INSERT-CREATE":
        command = (await runputquery(
          data as insertCreateResponseFormat
        )) as PutItemCommand;
        break;
      case "INSERT-UPDATE":
        command = (await runupdatequery(
          data as insertUpdateResponseFormat
        )) as UpdateItemCommand;
        break;
      case "MODIFY-CREATE":
        command = (await runputquery(
          data as modifyCreateResponseFormat
        )) as PutItemCommand;
        break;
      case "MODIFY-UPDATE":
        command = (await runupdatequery(
          data as modifyUpdateResponseFormat
        )) as UpdateItemCommand;
        break;
      default:
        throw new Error("Invalid action");
    }

    console.log("command", command);

    const client = new DynamoDBClient(config);

    const output = (await client.send(command as UpdateItemCommand)) as
      | PutItemCommandOutput
      | UpdateItemCommandOutput;

    return output;
  } catch (e) {
    console.log(e);
    throw e;
  }
};
