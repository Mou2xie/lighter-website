import type { APIRoute } from 'astro';
import { getDocs, plainText } from '../../lib/docs';

export const GET: APIRoute = async () => {
  const docs = await getDocs();
  return new Response(JSON.stringify(docs.map(({ title, href, section, body }) => ({
    title, href, section, text: plainText(body),
  }))), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
