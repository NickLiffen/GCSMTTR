import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

export const handler =  (
  event: APIGatewayProxyEventV2
): APIGatewayProxyResultV2 => {
  console.log(event);
  return 'success'
};
