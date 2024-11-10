import { db } from "./db";

export async function createUserIfNotExists(wallet: string, name: string) {
  const existingUser = await getUser(wallet);

  if (existingUser) {
    return existingUser;
  }

  return db.user.create({
    data: {
      wallet,
      name,
    },
  });
}

export async function getUser(wallet: string) {
  return db.user.findUnique({
    where: {
      wallet,
    },
  });
}

export async function createChallenge(
  wallet: string,
  position: string,
  totalAmount: number,
  createChallengeSig: string
) {
  // validations

  const existingWallet = await db.user.findUnique({
    where: { wallet },
  });

  if (!existingWallet) {
    await createNewUser(wallet, "User");
  }

  const challenge = await db.challenge.create({
    data: {
      wallet,
      position,
      totalAmount,
      createChallengeSig,
    },
  });
  return challenge.id;
}

export async function createNewUser(wallet: string, name: string) {
  return db.user.create({
    data: {
      wallet,
      name,
    },
  });
}

export async function getChallenge(id: string) {
  return db.challenge.findUnique({
    where: {
      id,
    },
  });
}

export async function getChallenges(wallet: string) {
  return db.challenge.findMany({
    where: {
      wallet,
    },
  });
}

export async function getChallengesByChallenger(wallet: string) {
  return db.challenge.findMany({
    where: {
      challengers: {
        some: {
          wallet,
        },
      },
    },
  });
}

export async function addChallenger(
  challengeId: string,
  wallet: string,
  guessSignature: string,
  selected: string,
  correct: boolean
) {
  console.log(correct, "correct");

  const existingWallet = await db.user.findUnique({
    where: { wallet },
  });

  if (!existingWallet) {
    await createNewUser(wallet, "User");
  }
  return db.challenge.update({
    where: {
      id: challengeId,
    },
    data: {
      challengers: {
        connect: {
          wallet,
        },
      },
      selectedPosition: selected,
      [correct ? "correctGuessesSig" : "incorrectGuessesSig"]: {
        push: guessSignature,
      },
    },
  });
}

export function markChallengeAsComplete(challengeId: string) {
  return db.challenge.update({
    where: {
      id: challengeId,
    },
    data: {
      completedAt: new Date(),
    },
  });
}

export function initTransaction(
  challengeId: string,
  sender: string,
  receiver: string,
  amount: number
) {
  return db.transaction.create({
    data: {
      challengeId,
      ToUser: sender,
      TxHash: "",
      FromUser: receiver,
      TokenAmount: amount,
      Token: "SOL",
      TxState: "Pending",
      Timestamp: 0,
    },
  });
}

export function updateTransaction(
  txid: number,
  txHash: string,
  timestamp: number
) {
  return db.transaction.update({
    where: {
      TxID: txid,
    },
    data: {
      TxHash: txHash,
      TxState: "Confirmed",
      Timestamp: timestamp,
    },
  });
}

export function getAllChallenges() {
  return db.challenge.findMany();
}
