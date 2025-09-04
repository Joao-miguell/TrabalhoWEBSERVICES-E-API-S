const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log do erro para depuração

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong!';

  res.status(statusCode).json({
    status: 'error',
    message: message,
    // Em produção, evite enviar detalhes de erro internos
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;