// src/Infrastructure/Express/routes/routes.js
const { Router } = require('express');
const AuthController = require('src/Infrastructure/Express/controllers/AuthController');
const validate = require('src/Infrastructure/Express/middlewares/validationMiddleware');
// AQUI ESTÁ A CORREÇÃO: Adicionado 's' em 'validationsSchemas'
const { registerSchema, loginSchema } = require('src/Infrastructure/Express/validationsSchemas/authSchemas'); 

// Importa a função que cria o middleware de autenticação
const createAuthMiddleware = require('src/Infrastructure/Express/middlewares/AuthMiddleware');

// O módulo agora recebe todas as dependências necessárias
module.exports = (registerUserUseCase, loginUserUseCase, logoutUserUseCase, tokenBlacklistRepository) => {
  const router = Router();
  
  // Instancia o controller com todas as suas dependências
  const authController = new AuthController(registerUserUseCase, loginUserUseCase, logoutUserUseCase);

  // Cria uma instância do middleware de autenticação, injetando o repositório da blacklist
  const authMiddleware = createAuthMiddleware(tokenBlacklistRepository);
  
  router.post('/register', validate(registerSchema), authController.register.bind(authController));
  router.post('/login', validate(loginSchema), authController.login.bind(authController));

  // Adiciona a nova rota de logout, protegida pelo middleware
  router.post('/logout', authMiddleware, authController.logout.bind(authController));

  // Exemplo de uma rota protegida para testar o token
  router.get('/me', authMiddleware, (req, res) => {
    // Se o middleware passar, o req.user estará disponível
    res.status(200).json({ message: 'This is a protected route', user: req.user });
  });

  return router;
};