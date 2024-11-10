export function validatedCreateChallengeQueryParams(requestUrl: URL) {
  let position: string;
  let amount: number;

  try {
    position = requestUrl.searchParams.get("position")!;
    if (!position) throw "position is required";
  } catch (err) {
    console.log(err);

    throw "Invalid input query parameter: position";
  }

  try {
    amount = parseFloat(requestUrl.searchParams.get("amount")!);
    if (isNaN(amount) || amount <= 0) throw "amount is too small";
  } catch (err) {
    console.log(err);

    throw "Invalid input query parameter: amount";
  }

  return {
    position,
    amount,
  };
}

export function validatedChallengeQueryParams(requestUrl: URL) {
  let challengeId: string;
  try {
    challengeId = requestUrl.searchParams.get("challengeId")!;
    if (!challengeId) throw "challengeId is required";
  } catch (err) {
    console.log(err);

    throw "Invalid input query parameter: challengeId";
  }

  return {
    challengeId,
  };
}

export function validatedPOSTChallengeQueryParams(requestUrl: URL): {
  position: string;

  bet: string;
  challengeId: string;
} {
  let position: string;

  let bet: string;
  let challengeId: string;

  try {
    challengeId = requestUrl.searchParams.get("challengeId")!;
    if (!challengeId) throw "challengeId is required";
  } catch (err) {
    console.log(err);

    throw "Invalid input query parameter: challengeId";
  }

  try {
    position = requestUrl.searchParams.get("position")!;
    if (!position) throw "position is required";
  } catch (err) {
    console.log(err);

    throw "Invalid input query parameter: position";
  }

  try {
    bet = requestUrl.searchParams.get("bet")!;
    if (!bet) throw "bet is required";
  } catch (err) {
    console.log(err);

    throw "Invalid input query parameter: bet";
  }

  return {
    position,
    bet,
    challengeId,
  };
}

export function calculateGridIndex(position: string, hor_set: string): number {
  const verticalMap: { [key: string]: number } = {
    top: 0,
    middle: 1,
    bottom: 2,
  };

  const horizontalMap: { [key: string]: number } = {
    left: 0,
    center: 1,
    right: 2,
  };

  const verticalIndex = verticalMap[position.toLowerCase()];
  const horizontalIndex = horizontalMap[hor_set.toLowerCase()];

  // console.log("verticalIndex", verticalIndex * 3 + horizontalIndex);

  return verticalIndex * 3 + horizontalIndex;
}
