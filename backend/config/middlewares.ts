import type { Core } from '@strapi/strapi';

const config: Core.Config.Middlewares = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:', 'https://proxy-event.ckeditor.com'],
          'img-src': ["'self'", 'data:', 'blob:', 'res.cloudinary.com', 'https://cdn.ckeditor.com'],
          'media-src': ["'self'", 'data:', 'blob:', 'res.cloudinary.com'],
          'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.ckeditor.com'],
          'frame-src': ["'self'", 'https://cdn.ckeditor.com'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
