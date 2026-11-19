import type { Core } from '@strapi/strapi';
import type { Context } from 'koa';
import { briefReference, briefUid } from './questionnaire';
import { exportBriefWord } from './word';

export function registerBriefExport(strapi: Core.Strapi) {
  strapi.server.routes({
    type: 'admin',
    routes: [
      {
        method: 'GET',
        path: '/client-brief-export/:documentId',
        info: { type: 'admin' },
        config: { policies: ['admin::isAuthenticatedAdmin'] },
        async handler(ctx: Context) {
          const { userAbility } = ctx.state;
          const permissionChecker = strapi.plugin('content-manager').service('permission-checker').create({ userAbility, model: briefUid });
          if (permissionChecker.cannot.read()) return ctx.forbidden();

          const entry = await strapi.db.query(briefUid).findOne({ where: { documentId: ctx.params.documentId } });
          if (!entry) return ctx.notFound();
          if (permissionChecker.cannot.read(entry, 'answers')) return ctx.forbidden();

          const word = await exportBriefWord(entry.templateVersion, entry.answers);
          ctx.attachment(`client-brief-${briefReference(entry.id)}.docx`);
          ctx.type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          ctx.set('Cache-Control', 'private, no-store');
          ctx.body = word;
        },
      },
    ],
  });
}
