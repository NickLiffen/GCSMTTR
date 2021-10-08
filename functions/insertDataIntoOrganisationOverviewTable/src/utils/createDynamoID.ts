export const createDynamoID = async ({
  organisationName,
}: parsedStream): Promise<dynamoDBReponse> => {
  const date = new Date() as Date;
  const month = date.toLocaleString("default", { month: "long" }) as string;
  const year = date.getUTCFullYear().toString() as string;
  const monthyPeriod = `${year}-${month}` as string;
  const dynamoId = `${monthyPeriod}/${organisationName}` as string;

  return [dynamoId, monthyPeriod];
};
