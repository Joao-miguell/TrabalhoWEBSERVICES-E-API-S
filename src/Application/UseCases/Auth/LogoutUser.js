// src/Application/UseCases/Auth/LogoutUser.js
const jwt = require('jsonwebtoken');

class LogoutUser {
  constructor(tokenBlacklistRepository) {
    this.tokenBlacklistRepository = tokenBlacklistRepository;
  }

  async execute(token) {
    // Decodifica o token para pegar a data de expiração ('exp')
    const decoded = jwt.decode(token);

    if (!decoded || !decoded.exp) {
      // Token inválido ou sem data de expiração, não há o que fazer.
      return;
    }

    const expiresAt = decoded.exp;
    const now = Math.floor(Date.now() / 1000); // Timestamp atual em segundos

    // Calcula o tempo restante de vida do token em segundos
    const expiresIn = expiresAt - now;

    if (expiresIn > 0) {
      // Adiciona o token na blacklist com o tempo de expiração restante
      await this.tokenBlacklistRepository.add(token, expiresIn);
    }
  }
}

module.exports = LogoutUser;