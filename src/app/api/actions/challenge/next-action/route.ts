import { addChallenger, getChallenge } from "@/lib/dbUtils";
import {
  calculateGridIndex,
  validatedPOSTChallengeQueryParams,
} from "@/lib/helper";
// import { sendPayouts } from "@/lib/payout.helper";
import {
  createActionHeaders,
  ActionError,
  CompletedAction,
  NextActionPostRequest,
} from "@solana/actions";
import { PublicKey } from "@solana/web3.js";

// Create the standard headers for this route (including CORS)
const headers = createActionHeaders();

export const GET = async (req: Request) => {
  console.log(req);
  return Response.json({ message: "Method not supported" }, { headers });
};

export const OPTIONS = async () => Response.json(null, { headers });

export const POST = async (req: Request) => {
  try {
    const requestUrl = new URL(req.url);
    const { position, bet, challengeId } =
      validatedPOSTChallengeQueryParams(requestUrl);
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

    let challenge;
    try {
      challenge = await getChallenge(challengeId);
    } catch (err) {
      console.error("Error fetching challenge:", err);
      const actionError: ActionError = { message: "Failed to fetch challenge" };
      return Response.json(actionError, { status: 500, headers });
    }
    if (!challenge) {
      const actionError: ActionError = { message: "Challenge not found" };
      return Response.json(actionError, { status: 404, headers });
    }
    console.log("challenge");
    console.log(position, bet, challengeId);

    console.log(challenge);

    try {
      await addChallenger(
        challengeId,
        account.toBase58(),
        signature,
        position,
        challenge.position === position
      );
    } catch (err) {
      console.error("Error adding challenger:", err);
      const actionError: ActionError = { message: "Failed to add challenger" };
      return Response.json(actionError, { status: 500, headers });
    }
    const payload: CompletedAction = {
      type: "completed",
      title: "Challenge Accepted",
      description: `You have successfully accepted the challenge by ${challenge.wallet}`,
      icon: new URL("/logo.jpeg", requestUrl.origin).toString(),
      label: "Challenge Accepted",
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
