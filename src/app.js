// src/app.js

// Importações de pacotes e middlewares
const express = require('express');
const cors = require('cors'); // Para permitir requisições de diferentes origens
const morgan = require('morgan'); // para logs de requisição
const swaggerUi = require('swagger-ui-express');
const yaml = require('js-yaml');
const fs = require('fs');

// Importações da Infraestrutura
const errorHandler = require('./Infrastructure/Express/middlewares/errorHandler');
const SequelizeUserRepository = require('./Infrastructure/Persistence/Sequelize/SequelizeUserRepository');
const RedisTokenBlacklistRepository = require('./Infrastructure/Persistence/Redis/RedisTokenBlacklistRepository');
const JWTProvider = require('./Infrastructure/Providers/JWTProvider');
// Corrigido para o nome do arquivo que você enviou
const authRoutes = require('./Infrastructure/Express/routes/routes');

// Importações dos Use Cases
const RegisterUser = require('./Application/UseCases/Auth/RegisterUser');
const LoginUser = require('./Application/UseCases/Auth/LoginUser');
// --- NOVO: Importa o caso de uso de Logout ---
const LogoutUser = require('./Application/UseCases/Auth/LogoutUser');

const app = express();

// Middlewares globais
app.use(express.json()); // Habilita o parsing de JSON no corpo das requisições
app.use(cors()); // permite requisições de outras origens (CORS)
app.use(morgan('dev')); // loga as requisições no console

// --- Injeção de dependências ---
// Repositórios
const userRepository = new SequelizeUserRepository();
const tokenBlacklistRepository = new RedisTokenBlacklistRepository();

// Provedores
const jwtProvider = new JWTProvider();

// Use Cases (recebem dependências de infraestrutura via construtor)
const registerUserUseCase = new RegisterUser(userRepository);
const loginUserUseCase = new LoginUser(userRepository, jwtProvider);
// --- NOVO: Instancia o caso de uso de Logout ---
const logoutUserUseCase = new LogoutUser(tokenBlacklistRepository);

// --- Rotas da API ---
// A rota principal do Express para o nosso serviço de autenticação
// --- ATUALIZADO: Passa todas as dependências necessárias para as rotas ---
app.use('/auth', authRoutes(
  registerUserUseCase,
  loginUserUseCase,
  logoutUserUseCase,
  tokenBlacklistRepository // Passado para ser usado pelo middleware de autenticação
));

// --- Configuração do Swagger UI ---
try {
  const swaggerDocument = yaml.load(fs.readFileSync('./docs/swagger.yml', 'utf8'));
  // Acessível em http://localhost:3000/api-docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (e) {
  console.error('Failed to load swagger.yml file:', e);
}

// --- Middleware de Tratamento de Erros ---
// Deve ser o último middleware a ser registrado
app.use(errorHandler);

module.exports = app;