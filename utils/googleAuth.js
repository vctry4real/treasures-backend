import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";

dotenv.config();

export default async function verifySocialAuth(credential, audience) {
  const googleAuth = new OAuth2Client();

  try {
    const ticket = await googleAuth.verifyIdToken({
      idToken: credential,
      audience: audience,
    });

    const payload = await ticket.getPayload();
    // Check if 'iss' is equal to "https://accounts.google.com" or "accounts.google.com"
    const isValidIss = [
      "https://accounts.google.com",
      "accounts.google.com",
    ].includes(payload.iss);

    // Check if 'aud' is the same as process.env.CLIENT_ID
    const isValidAud = payload.aud === process.env.CLIENT_ID;

    // Check if 'email_verified' is true
    const isEmailVerified = payload.email_verified;

    // Check if 'exp' time has not passed
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const isTokenNotExpired = payload.exp > currentTimestamp;

    return {
      payload,
      isValidIss,
      isValidAud,
      isEmailVerified,
      isTokenNotExpired,
    };
  } catch (error) {
    // Handle errors if necessary
    throw "Error verifying user auth " + error;
  }
}
