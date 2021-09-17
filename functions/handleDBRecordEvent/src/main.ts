import { DynamoDBStreamEvent, APIGatewayProxyResultV2 } from "aws-lambda";

export const handler = (
  event: DynamoDBStreamEvent
): APIGatewayProxyResultV2 => {
  const { Records } = event;

  const { eventName, dynamodb } = Records[0];

  console.log(eventName);

  console.log(dynamodb);

  const d = new Date();
  const month = d.getMonth().toString();
  const year = d.getMonth().toString();
  const regExp = /^0[0-9].*$/;
  const qualifiedMonth = regExp.test(month) ? month : `0${month}`;
  const monthyPeriod = `${year}-${qualifiedMonth}`;

  console.log(monthyPeriod);

  return "success";
};
