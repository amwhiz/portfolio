/**
 * The function `getReferralCode` generates a referral code by concatenating the string "NEXT" with a
 * random number generated from the current timestamp.
 */
export const getReferralCode = (): string =>
  `NEXT${Math.floor(Math.random() * Date.now())
    .toString(8)
    .substring(0, 6)}`;
