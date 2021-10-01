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
      organizationName: {
        S: data.organizationName,
      },
      repositoryName: {
        S: data.repositoryName,
      },
      monthlyPeriod: {
        S: data.reportingDate,
      },
      openAlerts: {
        S: data.openAlerts,
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
      organizationName: {
        S: data.organizationName,
      },
      repositoryName: {
        S: data.repositoryName,
      },
      monthlyPeriod: {
        S: data.reportingDate,
      },
      openAlerts: {
        S: data.openAlerts,
      },
      totalTimeToRemediate: {
        S: data.totalTimeToRemediate,
      },
      meanTimeToRemediate: {
        S: data.meanTimeToRemediate,
      },
      numberFixed: {
        S: data.numberFixed,
      },
      numberManuallyCosed: {
        S: data.numberManuallyCosed,
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
        S: data.openAlerts,
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
        S: data.openAlerts,
      },
      ":numberFixed": {
        S: data.numberFixed,
      },
      ":numberManuallyCosed": {
        S: data.numberManuallyCosed,
      },
      ":totalTimeToRemediate": {
        S: data.totalTimeToRemediate,
      },
      ":meanTimeToRemediate": {
        S: data.meanTimeToRemediate,
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
    }

    input = await modifyUpdate(data as modifyUpdateResponseFormat);

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
    }

    input = await modifyCreate(data as modifyCreateResponseFormat);

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
    let command = {} as UpdateItemCommand | PutItemCommand;

    command = (
      data.action === "INSERT-CREATE" ? await runputquery(data) : {}
    ) as PutItemCommand;
    command = (
      data.action === "INSERT-UPDATE" ? await runupdatequery(data) : {}
    ) as UpdateItemCommand;
    command = (
      data.action === "MODIFY-CREATE" ? await runputquery(data) : {}
    ) as PutItemCommand;
    command = (
      data.action === "MODIFY-UPDATE" ? await runupdatequery(data) : {}
    ) as UpdateItemCommand;

    const client = new DynamoDBClient(config);

    const output = (await client.send(command)) as
      | PutItemCommandOutput
      | UpdateItemCommandOutput;

    return output;
  } catch (e) {
    console.log(e);
    throw e;
  }
};
