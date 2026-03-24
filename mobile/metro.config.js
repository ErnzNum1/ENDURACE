const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// ── Dev-only web proxy: forwards /api/* to local backend ─────────
// Only active when running `npx expo start` for web development.
// Has no effect on the Android/iOS APK build.
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      if (req.url.startsWith('/api/')) {
        const http = require('http');

        const BACKEND_HOST = '127.0.0.1';
        const BACKEND_PORT = 5000;

        const chunks = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', () => {
          const bodyBuffer = Buffer.concat(chunks);

          const headers = { ...req.headers };
          headers['host']           = `${BACKEND_HOST}:${BACKEND_PORT}`;
          headers['content-length'] = Buffer.byteLength(bodyBuffer).toString();
          delete headers['transfer-encoding'];

          const options = {
            hostname: BACKEND_HOST,
            port:     BACKEND_PORT,
            path:     req.url,
            method:   req.method,
            headers,
          };

          const proxy = http.request(options, (proxyRes) => {
            const responseHeaders = { ...proxyRes.headers };
            responseHeaders['Access-Control-Allow-Origin']      = req.headers.origin || '*';
            responseHeaders['Access-Control-Allow-Credentials'] = 'true';
            responseHeaders['Access-Control-Allow-Methods']     = 'GET,POST,PUT,DELETE,PATCH,OPTIONS';
            responseHeaders['Access-Control-Allow-Headers']     = 'Content-Type,Authorization';
            delete responseHeaders['content-encoding'];
            res.writeHead(proxyRes.statusCode, responseHeaders);
            proxyRes.pipe(res, { end: true });
          });

          proxy.on('error', (err) => {
            console.error('[Metro proxy] Error:', err.message);
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: `Proxy error: ${err.message}` }));
          });

          if (bodyBuffer.length > 0) proxy.write(bodyBuffer);
          proxy.end();
        });

        req.on('error', (err) => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: err.message }));
        });

        return;
      }
      middleware(req, res, next);
    };
  },
};

module.exports = config;