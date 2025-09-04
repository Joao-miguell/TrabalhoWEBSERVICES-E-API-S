// src/Application/UseCases/Auth/LoginUser.js
const AuthOutput = require('src/Application/DTOs/UserOutput');
const InvalidCredentialsException = require('src/Domain/Exceptions/InvalidCredentialsException');

class LoginUser {
  constructor(userRepository, jwtProvider) {
    this.userRepository = userRepository;
    this.jwtProvider = jwtProvider;
  }

  async execute(input) { // 'input' é uma instância de LoginUserInput
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new InvalidCredentialsException('Invalid email or password.');
    }

    const isPasswordValid = await user.comparePassword(input.password);

    if (!isPasswordValid) {
      throw new InvalidCredentialsException('Invalid email or password.');
    }

    const token = this.jwtProvider.generateToken({ userId: user.id, email: user.email.value });

    return new AuthOutput(token, {
      id: user.id,
      name: user.name.value,
      email: user.email.value
    });
  }
}