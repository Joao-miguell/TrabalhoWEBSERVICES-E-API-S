// src/Infrastructure/Persistence/Sequelize/SequelizeUserRepository.js
const IUserRepository = require('src/Domain/Repositories/IUserRepository');
const UserModel = require('./models/UserModel');
const User = require('src/Domain/User/User');

class SequelizeUserRepository extends IUserRepository {
  async save(user) {
    const userData = {
      id: user.id,
      name: user.name.value,
      email: user.email.value,
      password: user.password.hashedPassword,
    };
    await UserModel.create(userData);
  }

  async findByEmail(email) {
    const userModel = await UserModel.findOne({ where: { email } });

    if (!userModel) {
      return null;
    }

    // Recria a entidade de domínio a partir dos dados do banco
    return new User(
      userModel.name,
      userModel.email,
      userModel.password, // A senha já está hasheada no banco
      userModel.id
    );
  }

  async findById(id) {
    const userModel = await UserModel.findByPk(id);

    if (!userModel) {
      return null;
    }

    return new User(
      userModel.name,
      userModel.email,
      userModel.password,
      userModel.id
    );
  }
}

module.exports = SequelizeUserRepository;