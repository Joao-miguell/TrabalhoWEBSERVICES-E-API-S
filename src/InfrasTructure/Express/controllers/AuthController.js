// src/Infrastructure/Express/controllers/AuthController.js
const RegisterUserInput = require('src/Application/DTOs/RegisterUserInput');
const LoginUserInput = require('src/Application/DTOs/LoginUserInput');

class AuthController {
  // O construtor agora recebe o novo caso de uso de logout
  constructor(registerUserUseCase, loginUserUseCase, logoutUserUseCase) {
    this.registerUserUseCase = registerUserUseCase;
    this.loginUserUseCase = loginUserUseCase;
    this.logoutUserUseCase = logoutUserUseCase; // Adicionado
  }

  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const input = new RegisterUserInput(name, email, password);
      // O caso de uso de registro agora retorna um objeto simples
      const user = await this.registerUserUseCase.execute(input);
      return res.status(201).json(user);
    } catch (error) {
      next(error); // Encaminha para o middleware de tratamento de erros
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const input = new LoginUserInput(email, password);
      const authOutput = await this.loginUserUseCase.execute(input);
      return res.status(200).json(authOutput);
    } catch (error) {
      next(error);
    }
  }

  // Lógica de logout implementada
  async logout(req, res, next) {
    try {
      // Extrai o token do header de autorização
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (token) {
        // Executa o caso de uso para adicionar o token à blacklist
        await this.logoutUserUseCase.execute(token);
      }
      
      return res.status(200).json({ message: 'Logged out successfully.' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;