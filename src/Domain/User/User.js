const Email = require('./ValueObjects/Email');
const Password = require('./ValueObjects/Password');
const Name = require('./ValueObjects/Name');
const { v4: uuidv4 } = require('uuid');

class User {
  // O construtor é para criar um NOVO usuário com senha pura
  constructor(name, email, plainPassword, id = uuidv4()) {
    if (!id || !name || !email || !plainPassword) {
      throw new Error("User properties cannot be empty.");
    }
    this.id = id;
    this.name = new Name(name);
    this.email = new Email(email);
    // O construtor principal SEMPRE irá hashear a senha
    this.password = new Password(plainPassword);
  }

  // --- NOVO MÉTODO ---
  // Este método estático reconstrói um usuário a partir de dados já existentes (do banco)
  static hydrate(id, name, email, hashedPassword) {
    const user = Object.create(User.prototype); // Cria uma instância sem chamar o construtor
    user.id = id;
    user.name = new Name(name);
    user.email = new Email(email);
    // Aqui está a chave: passamos a senha hasheada e a flag 'true'
    user.password = new Password(hashedPassword, true);
    return user;
  }

  async comparePassword(plainPassword) {
    return await this.password.compare(plainPassword);
  }

  updatePassword(newPassword) {
    this.password = new Password(newPassword);
  }

  toObject() {
    return {
      id: this.id,
      name: this.name.value,
      email: this.email.value,
      password: this.password.hashedPassword
    };
  }
}

module.exports = User;