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

    // --- CORREÇÃO APLICADA AQUI ---
    // Usamos o método hydrate para reconstruir o usuário corretamente
    return User.hydrate(
      userModel.id,
      userModel.name,
      userModel.email,
      userModel.password // Passando a senha que já está hasheada
    );
  }

  async findById(id) {
    const userModel = await UserModel.findByPk(id);

    if (!userModel) {
      return null;
    }

    // --- CORREÇÃO APLICADA AQUI TAMBÉM ---
    return User.hydrate(
      userModel.id,
      userModel.name,
      userModel.email,
      userModel.password
    );
  }
}

module.exports = SequelizeUserRepository;