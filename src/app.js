// src/app.js

// 1. INICIALIZA O MODULE-ALIAS: Esta deve ser a PRIMEIRA linha do seu arquivo.
require('module-alias/register');

// Importações de pacotes e middlewares
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const yaml = require('js-yaml');
const fs = require('fs');

// 2. CAMINHOS CORRIGIDOS: Todas as importações locais agora usam o alias 'src'.
const errorHandler = require('src/Infrastructure/Express/middlewares/errorHandler');
const SequelizeUserRepository = require('src/Infrastructure/Persistence/Sequelize/SequelizeUserRepository');
const RedisTokenBlacklistRepository = require('src/Infrastructure/Persistence/Redis/RedisTokenBlacklistRepository');
const JWTProvider = require('src/Infrastructure/Providers/JWTProvider');
const authRoutes = require('src/Infrastructure/Express/routes/routes');

// Importações dos Use Cases
const RegisterUser = require('src/Application/UseCases/Auth/RegisterUser');
const LoginUser = require('src/Application/UseCases/Auth/LoginUser');
const LogoutUser = require('src/Application/UseCases/Auth/LogoutUser');

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
const logoutUserUseCase = new LogoutUser(tokenBlacklistRepository);

// --- Rotas da API ---
// A rota principal do Express para o nosso serviço de autenticação
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