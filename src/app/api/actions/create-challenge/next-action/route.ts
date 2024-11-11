import { createChallenge, createUserIfNotExists } from "@/lib/dbUtils";
import {
  calculateGridIndex,
  validatedCreateChallengeQueryParams,
} from "@/lib/helper";
import {
  createActionHeaders,
  ActionError,
  CompletedAction,
  NextActionPostRequest,
} from "@solana/actions";
import { PublicKey } from "@solana/web3.js";

// Create the standard headers for this route (including CORS)
const headers = createActionHeaders();

export const GET = async () => {
  return Response.json({ message: "Method not supported" }, { headers });
};

export const OPTIONS = async () => Response.json(null, { headers });

export const POST = async (req: Request) => {
  try {
    const requestUrl = new URL(req.url);
    const { position, amount } =
      validatedCreateChallengeQueryParams(requestUrl);
    const body: NextActionPostRequest = await req.json();

    // Validate the client-provided input
    let account: PublicKey;
    try {
      account = new PublicKey(body.account);
    } catch (err) {
      console.log(err);
      throw 'Invalid "account" provided';
    }

    let signature: string;
    try {
      signature = body.signature!;
      if (!signature) throw "Invalid signature";
    } catch (err) {
      console.log(err);
      throw 'Invalid "signature" provided';
    }

    console.log(
      `Creating challenge with position: ${position}, amount: ${amount} and signature: ${signature}, account: ${account.toBase58()}`
    );

    // Create user if not exists
    try {
      await createUserIfNotExists(account.toBase58(), "User");
    } catch (err) {
      console.log(err);
      throw "Failed to create user";
    }

    let challengeId: string;
    try {
      challengeId = await createChallenge(
        account.toBase58(),
        position,
        amount,
        signature
      );
    } catch (err) {
      console.error(err);
      throw "Failed to create challenge";
    }

    const payload: CompletedAction = {
      type: "completed",
      title: "Challenge created",
      description: `Your challenge has been created successfully\n URL: https://dial.to/?action=solana-action:${requestUrl.origin}/api/actions/challenge?challengeId=${challengeId}&cluster=devnet`,
      icon: new URL("/logo.jpeg", requestUrl.origin).toString(),
      label: "Challenge created",
    };

    return Response.json(payload, { headers });
  } catch (err) {
    console.error(err);
    const actionError: ActionError = { message: "An unknown error occurred" };
    if (typeof err == "string") actionError.message = err;
    return Response.json(actionError, {
      status: 400,
      headers,
    });
  }
};
