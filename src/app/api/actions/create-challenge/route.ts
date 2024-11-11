import { vaultPublicKey } from "@/lib/constants";
import { validatedCreateChallengeQueryParams } from "@/lib/helper";
import {
  ActionPostResponse,
  createPostResponse,
  ActionGetResponse,
  ActionPostRequest,
  createActionHeaders,
  ActionError,
  LinkedAction,
} from "@solana/actions";
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

// Create the standard headers for this route (including CORS)
const headers = createActionHeaders();

export const GET = async (req: Request) => {
  try {
    const requestUrl = new URL(req.url);
    const actions: LinkedAction[] = [
      {
        type: "transaction",
        label: "Create Challenge",
        href: "/api/actions/create-challenge?position={position}&amount={amount}",
        parameters: [
          {
            name: "position",
            label: "select position",
            required: true,
            type: "radio",
            options: [
              { value: "top-left", label: "Top-Left" },
              { value: "top-right", label: "Top-Right" },
              { value: "center", label: "Center" },
              { value: "bottom-left", label: "Bottom-Left" },
              { value: "bottom-right", label: "Bottom-Right" },
            ],
          },
          {
            name: "amount",
            label: "Bet Amount (in SOL)",
            required: true,
            type: "number",
          },
        ],
      },
    ];
    const payload: ActionGetResponse = {
      type: "action",
      title: "Freekick",
      icon: new URL("/logo.jpeg", requestUrl.origin).toString(),
      description:
        "Create a new challenge for the Freekick game. \nSelect the position where you want to shoot, and let your friend try to block your goal.",
      label: "Create Challenge",
      links: { actions },
    };
    console.log(headers);
    return Response.json(payload, { headers });
  } catch (err) {
    console.error(err);
    const actionError: ActionError = { message: "An unknown error occurred" };
    if (typeof err === "string") actionError.message = err;
    return Response.json(actionError, { status: 400, headers });
  }
};

export const OPTIONS = async () => Response.json(null, { headers });

export const POST = async (req: Request) => {
  try {
    const requestUrl = new URL(req.url);
    const { position, amount } =
      validatedCreateChallengeQueryParams(requestUrl);
    const body: ActionPostRequest = await req.json();

    // Validate the client-provided input
    let account: PublicKey;
    try {
      account = new PublicKey(body.account);
    } catch (err) {
      console.log(err);
      throw 'Invalid "account" provided';
    }

    const connection = new Connection(
      process.env.SOLANA_RPC! || clusterApiUrl("devnet")
    );

    // Create an instruction to transfer native SOL from one wallet to vault
    const transferSolInstruction = SystemProgram.transfer({
      fromPubkey: account,
      toPubkey: new PublicKey(vaultPublicKey),
      lamports: amount * LAMPORTS_PER_SOL,
    });

    // Get the latest blockhash and block height
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();

    const transaction = new Transaction({
      feePayer: account,
      blockhash,
      lastValidBlockHeight,
    }).add(transferSolInstruction);

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        type: "transaction",
        transaction,
        message: "Create Freekick Challenge",
        links: {
          next: {
            type: "post",
            href: `/api/actions/create-challenge/next-action?position=${position}&amount=${amount}`,
          },
        },
      },
    });

    return Response.json(payload, { headers });
  } catch (err) {
    console.error(err);
    const actionError: ActionError = { message: "An unknown error occurred" };
    if (typeof err === "string") actionError.message = err;
    return Response.json(actionError, { status: 400, headers });
  }
};
