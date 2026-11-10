import type { APIRoute } from 'astro';
import { docsSearchResponse } from '../../../lib/docs';

export const GET: APIRoute = () => docsSearchResponse('zh');
