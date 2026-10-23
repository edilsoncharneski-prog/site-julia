import { NextRequest } from 'next/server';
import { getDriveFileId } from '@/lib/products';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Proxy de streaming para vídeos públicos do Google Drive.
 *
 * Por que este endpoint existe:
 * O player embutido do Google Drive (`/file/d/{id}/preview`) depende de cookies
 * de terceiros do domínio `youtube.googleapis.com` dentro de um iframe aninhado.
 * No Safari/iOS (ITP) e navegadores mobile com bloqueio de cookies de terceiros,
 * o iframe do Drive fica travado em tela preta.
 *
 * Esta rota encaminha requisições HTTP `Range` diretamente para o servidor de
 * arquivos do Google Drive e devolve o stream `video/mp4` na mesma origem do site,
 * permitindo que a tag `<video playsInline controls>` nativa funcione em 100%
 * dos celulares (iPhone/iOS e Android) e computadores.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const cleanId = getDriveFileId(id);

  if (!cleanId) {
    return new Response('ID de vídeo inválido', { status: 400 });
  }

  const upstreamUrl = `https://drive.usercontent.google.com/download?id=${cleanId}&export=download&confirm=t`;
  const rangeHeader = request.headers.get('range');

  const upstreamHeaders = new Headers();
  if (rangeHeader) {
    upstreamHeaders.set('Range', rangeHeader);
  }
  upstreamHeaders.set(
    'User-Agent',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  );

  try {
    const upstream = await fetch(upstreamUrl, {
      method: 'GET',
      headers: upstreamHeaders,
      redirect: 'follow',
      cache: 'no-store',
    });

    if (!upstream.ok && upstream.status !== 206) {
      return new Response('Não foi possível carregar o vídeo', {
        status: upstream.status,
      });
    }

    const responseHeaders = new Headers();
    const rawContentType = upstream.headers.get('content-type') || 'video/mp4';
    const contentType =
      rawContentType === 'application/octet-stream' ||
      rawContentType.startsWith('text/')
        ? 'video/mp4'
        : rawContentType;

    responseHeaders.set('Content-Type', contentType);
    responseHeaders.set('Accept-Ranges', 'bytes');
    responseHeaders.set(
      'Cache-Control',
      'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800'
    );

    const contentLength = upstream.headers.get('content-length');
    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength);
    }

    const contentRange = upstream.headers.get('content-range');
    if (contentRange) {
      responseHeaders.set('Content-Range', contentRange);
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error('Erro no streaming do vídeo:', err);
    return new Response('Erro interno ao transmitir vídeo', { status: 502 });
  }
}
