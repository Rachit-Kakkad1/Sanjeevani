const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    };
  } catch (error) {
    throw new Error("Invalid Google token: " + error.message);
  }
}

function generateJWT(user) {
  return jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
}

module.exports = { verifyGoogleToken, generateJWT };
