const { createProxyMiddleware } = require('http-proxy-middleware');

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