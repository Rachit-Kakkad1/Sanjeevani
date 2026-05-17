const { verifyGoogleToken, generateJWT } = require('../services/auth.service');

const googleAuth = async (req, res, next) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ success: false, error: 'Token is required' });
    }

    const user = await verifyGoogleToken(token);
    const jwtToken = generateJWT(user);

    return res.status(200).json({
      success: true,
      user,
      token: jwtToken
    });
  } catch (error) {
    return res.status(401).json({ success: false, error: error.message });
  }
};

module.exports = {
  googleAuth
};
