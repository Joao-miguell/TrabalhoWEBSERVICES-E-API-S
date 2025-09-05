// src/Infrastructure/Persistence/Redis/RedisTokenBlacklistRepository.js
const ITokenBlacklistRepository = require('src/Domain/Repositories/ITokenBlackListRepository');
const { redisClient } = require('./RedisClient');

class RedisTokenBlacklistRepository extends ITokenBlacklistRepository {
  async add(token, expiresIn) {
    // A chave será o próprio token para facilitar a busca.
    // 'EX' define o tempo de expiração em segundos.
    await redisClient.set(token, 'blacklisted', {
      EX: expiresIn,
    });
  }

  async exists(token) {
    const result = await redisClient.get(token);
    return result !== null;
  }
}

module.exports = RedisTokenBlacklistRepository;