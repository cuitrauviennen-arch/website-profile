import type { Core } from '@strapi/strapi';
import { processBriefNotifications } from '../src/brief/telegram';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Server => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  cron: {
    enabled: true,
    tasks: {
      clientBriefNotifications: {
        task: ({ strapi }) => processBriefNotifications(strapi),
        options: { rule: '*/30 * * * * *' },
      },
    },
  },
});

export default config;
