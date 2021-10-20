import { SSMClient, GetParametersCommand } from "@aws-sdk/client-ssm";

export const ssm = async (): Promise<void> => {
  const region = process.env.REGION ? process.env.REGION : "us-east-1";

  const client = new SSMClient({ region });
  const command = new GetParametersCommand({
    Names: [
      "/gcsmttr/APP_CLIENT_ID",
      "/gcsmttr/APP_CLIENT_SECRET",
      "/gcsmttr/APP_ID",
      "/gcsmttr/APP_INSTALLATION_ID",
      "/gcsmttr/APP_PRIVATE_KEY",
      "/gcsmttr/GITHUB_WEBHOOKS_SECRET",
    ],
    WithDecryption: true,
  });
  try {
    const { Parameters } = await client.send(command);
    console.log(Parameters);

    if (Parameters) {
      Parameters.forEach((param) => {
        const name = param.Name ? param.Name.replace("/gcsmttr/", "") : "";
        const value = param.Value ? param.Value : "";
        process.env[name] = value;
      });
    }
  } catch (err) {
    console.error("Error within function (ssm)", err);
    throw err;
  }
};
