// src/Application/UseCases/Auth/RegisterUser.js
const User = require('src/Domain/User/User');
const UserOutput = require('src/Application/DTOs/UserOutput');
const UserAlreadyExistsException = require('src/Domain/Exceptions/UserAlreadyExistsException');

class RegisterUser {
  constructor(userRepository) {
    this.userRepository = userRepository; // IUserRepository
  }

  async execute(input) { // input é RegisterUserInput
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new UserAlreadyExistsException('User with this email already exists.');
    }

    const user = new User(input.name, input.email, input.password);

    await this.userRepository.save(user);

    return new UserOutput(user);
  }
}

module.exports = RegisterUser;