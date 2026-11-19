import type { Context } from 'koa';
import { briefReference, briefUid, InvalidBrief, validateSubmission } from '../../../brief/questionnaire';
import { processBriefNotifications } from '../../../brief/telegram';

const submissionWindow = 10 * 60_000;
const submissionLimit = 12;
const recentSubmissions = new Map<string, { count: number; expires: number }>();

function limited(ip: string) {
  const now = Date.now();
  for (const [key, entry] of recentSubmissions) if (entry.expires <= now) recentSubmissions.delete(key);
  const entry = recentSubmissions.get(ip);
  if (entry) return ++entry.count > submissionLimit;
  if (recentSubmissions.size >= 2048) return true;
  recentSubmissions.set(ip, { count: 1, expires: now + submissionWindow });
  return false;
}

export default {
  async submit(ctx: Context) {
    ctx.set('Cache-Control', 'no-store');
    let submission: ReturnType<typeof validateSubmission>;
    try {
      submission = validateSubmission(ctx.request.body);
    } catch (error) {
      if (error instanceof InvalidBrief) return ctx.badRequest(error.message);
      throw error;
    }

    const store = strapi.db.query(briefUid);
    const findSubmission = () => store.findOne({ where: { submissionId: submission.submissionId } });
    let saved = await findSubmission();
    let created = false;
    if (!saved) {
      if (limited(ctx.ip)) {
        ctx.set('Retry-After', String(submissionWindow / 1000));
        ctx.status = 429;
        ctx.body = { error: { message: 'Too many submissions. Please wait a few minutes and try again.' } };
        return;
      }

      try {
        saved = await strapi.documents(briefUid).create({
          data: { ...submission, notificationStatus: 'pending', notificationDueAt: new Date().toISOString() },
        });
        if (!saved.id) throw new Error('Client brief was not persisted');
        created = true;
      } catch (error) {
        // A concurrent retry might have created the record before this request did.
        saved = await findSubmission();
        if (!saved) throw error;
      }
    }

    if (saved.answerHash !== submission.answerHash) {
      ctx.status = 409;
      ctx.body = { error: { message: 'This submission ID already belongs to a different brief.' } };
      return;
    }

    ctx.status = created ? 201 : 200;
    ctx.body = { reference: briefReference(saved.id) };
    void processBriefNotifications(strapi);
  },
};
