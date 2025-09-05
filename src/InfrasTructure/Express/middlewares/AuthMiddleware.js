const jwt = require('jsonwebtoken');
const config = require('src/config');

// A função agora recebe o repositório como dependência e retorna o middleware
module.exports = (tokenBlacklistRepository) => async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // 1. Checa se o token está na blacklist do Redis
    const isBlacklisted = await tokenBlacklistRepository.exists(token);
    if (isBlacklisted) {
      return res.status(401).json({ message: 'Token has been revoked. Please log in again.' });
    }

    // 2. Verifica a assinatura e validade do token
    jwt.verify(token, config.jwt.secret, (err, user) => {
      if (err) {
        // O erro pode ser de token expirado ou inválido
        return res.status(401).json({ message: 'Invalid or expired token.' });
      }
      // Adiciona o payload do token ao objeto de requisição
      req.user = user; 
      next();
    });
  } catch (error) {
    // Caso ocorra um erro inesperado (ex: Redis fora do ar)
    next(error);
  }
};