const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  console.log('User to be signed:', user);
  const payload = {
    id: user._id,
    avatarUrl: user.avatarUrl,
    username: user.name,
    userEmail: user.email,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15d' });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
