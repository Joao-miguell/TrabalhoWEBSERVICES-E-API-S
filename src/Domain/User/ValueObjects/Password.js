// src/Domain/User/ValueObjects/Password.js
const bcrypt = require('bcryptjs'); // Usado para hashing

class Password {
  constructor(value, isHashed = false) {
    if (!value) {
      throw new Error("Password cannot be empty.");
    }

    if (!isHashed && value.length < 6) { // Exemplo de regra de negócio: min 6 caracteres
      throw new Error("Password must be at least 6 characters long.");
    }

    this.hashedPassword = isHashed ? value : this.hash(value);
  }

  hash(plainPassword) {
    // Síncrono para simplificar, mas idealmente usar bcrypt.hash assíncrono
    return bcrypt.hashSync(plainPassword, 10);
  }

  async compare(plainPassword) {
    return await bcrypt.compare(plainPassword, this.hashedPassword);
  }

  equals(otherPassword) {
    return otherPassword instanceof Password && this.hashedPassword === otherPassword.hashedPassword;
  }
}

module.exports = Password;