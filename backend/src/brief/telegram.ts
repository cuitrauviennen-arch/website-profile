import type { Core } from '@strapi/strapi';
import { briefReference, briefUid } from './questionnaire';

const maxAttempts = 6;
const leaseMs = 2 * 60_000;
let processing = false;

interface BriefNotification {
  id: number;
  documentId: string;
  company: string;
  notificationAttempts: number;
  notificationStatus: 'pending' | 'sending';
}

function briefAdminLink(strapi: Core.Strapi, documentId: string) {
  const configured = new URL(strapi.config.get<string>('admin.absoluteUrl'));
  const renderUrl = process.env.RENDER_EXTERNAL_URL;
  const admin = renderUrl ? new URL(configured.pathname, renderUrl) : configured;
  admin.pathname = `${admin.pathname.replace(/\/$/, '')}/content-manager/collection-types/${briefUid}/${documentId}`;
  return admin.toString();
}

async function sendNotification(strapi: Core.Strapi, brief: BriefNotification, token: string, chat: string) {
  const company = brief.company?.replace(/\s+/g, ' ').trim() || 'Not provided';
  const reference = briefReference(brief.id);
  const link = briefAdminLink(strapi, brief.documentId);
  try {
    const result = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chat,
        text: `New marketing brief\nCompany: ${company}\nBrief ID: ${reference}`,
        reply_markup: { inline_keyboard: [[{ text: 'Open in Strapi Admin', url: link }]] },
      }),
      signal: AbortSignal.timeout(12_000),
    });
    const payload = await result.json().catch(() => null) as { ok?: boolean; parameters?: { retry_after?: number } } | null;
    if (result.ok && payload?.ok) return { sent: true, retryAfter: 0 };
    const retryAfter = Number(result.headers.get('Retry-After')) || payload?.parameters?.retry_after || 0;
    strapi.log.warn(`Client brief ${reference}: Telegram returned HTTP ${result.status}`);
    return { sent: false, retryAfter };
  } catch {
    strapi.log.warn(`Client brief ${reference}: Telegram request failed`);
    return { sent: false, retryAfter: 0 };
  }
}

export async function processBriefNotifications(strapi: Core.Strapi) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (processing || !token || !chat) return;
  processing = true;
  try {
    const store = strapi.db.query(briefUid);
    const now = new Date().toISOString();
    const due = await store.findMany({
      where: { notificationStatus: { $in: ['pending', 'sending'] }, notificationDueAt: { $lte: now } },
      orderBy: { notificationDueAt: 'asc' },
      limit: 8,
    }) as BriefNotification[];

    for (const brief of due) {
      const attempts = brief.notificationAttempts + 1;
      const lease = new Date(Date.now() + leaseMs).toISOString();
      const claimed = await store.updateMany({
        where: {
          id: brief.id,
          notificationStatus: brief.notificationStatus,
          notificationAttempts: brief.notificationAttempts,
          notificationDueAt: { $lte: now },
        },
        data: attempts > maxAttempts
          ? { notificationStatus: 'failed', notificationDueAt: null }
          : { notificationStatus: 'sending', notificationAttempts: attempts, notificationDueAt: lease },
      });
      if (claimed.count !== 1 || attempts > maxAttempts) continue;

      const { sent, retryAfter } = await sendNotification(strapi, brief, token, chat);
      const status = sent ? 'sent' : attempts >= maxAttempts ? 'failed' : 'pending';
      const delay = Math.max(30 * 2 ** (attempts - 1), retryAfter);
      await store.updateMany({
        where: { id: brief.id, notificationStatus: 'sending', notificationAttempts: attempts },
        data: { notificationStatus: status, notificationDueAt: status === 'pending' ? new Date(Date.now() + delay * 1000).toISOString() : null },
      });
    }
  } catch {
    strapi.log.error('Client brief notification worker could not process the queue');
  } finally {
    processing = false;
  }
}
