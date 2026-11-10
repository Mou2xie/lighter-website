import type { APIRoute } from 'astro';
import { llmsResponse } from '../../lib/llms';
export const GET: APIRoute = () => llmsResponse(false, 'zh');
