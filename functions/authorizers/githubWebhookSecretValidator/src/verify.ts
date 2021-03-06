import { verify } from "@octokit/webhooks-methods";

export const secretVerifier = async (event: any): Promise<boolean> => {
  try {
    console.log(event);

    const body = event.body as string;
    const signature = event.signature as string;

    console.log("body", body);
    console.log("signature", signature);
    console.log(
      "process.env.GITHUB_WEBHOOKS_SECRET",
      process.env.GITHUB_WEBHOOKS_SECRET
    );

    const authedAnswer = await verify(
      process.env.GITHUB_WEBHOOKS_SECRET,
      body,
      signature
    );
    return authedAnswer;
  } catch (err) {
    console.error("Error within function (secretVerifier)", err);
    throw err;
  }
};
