const { createProxyMiddleware } = require('http-proxy-middleware');
const target = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8080'
  : 'https://backend:443';

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://backend:443',
      changeOrigin: true,
      secure: false,  // Игнорировать ошибки SSL (только для dev)
      ws: true,       // Поддержка WebSocket
    })
  );
};