const { verifyToken } = require('../auth/jwt');

const authenticate = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new Error('No autorizado.');

  const token = authHeader.split(' ')[1];
  const user = verifyToken(token);
  if (!user) throw new Error('Token inválido o expirado.');
  return user;
};

module.exports = authenticate;
