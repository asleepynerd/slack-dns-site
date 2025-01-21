import crypto from "crypto";

export function verifyMailgunWebhook(
  timestamp: string,
  token: string,
  signature: string
) {
  const encodedToken = crypto
    .createHmac("sha256", process.env.MAILGUN_WEBHOOK_SIGNING_KEY!)
    .update(timestamp.concat(token))
    .digest("hex");

  return encodedToken === signature;
}
