// src/app/api/admin/carousel/upload/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdminAuthenticated } from '@/lib/admin-auth';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB

export async function POST(request: Request) {
  try {
    const authenticated = await isAdminAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Sessão expirada ou não autorizada. Faça login novamente.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const isWebpMime = file.type === 'image/webp';
    const isWebpExt = file.name.toLowerCase().endsWith('.webp');

    if (!isWebpMime || !isWebpExt) {
      return NextResponse.json(
        { error: 'Formato inválido. Apenas imagens com extensão .webp são permitidas.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'O arquivo excede o limite máximo permitido de 1 MB.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Validação extra de Magic Bytes (RIFF....WEBP)
    const isValidWebpHeader =
      buffer.length >= 12 &&
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP';

    if (!isValidWebpHeader) {
      return NextResponse.json(
        { error: 'Arquivo corrompido ou não é um WebP autêntico.' },
        { status: 400 }
      );
    }

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.webp`;
    const filePath = `slides/${fileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('carousel-images')
      .upload(filePath, buffer, {
        contentType: 'image/webp',
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('carousel-images')
      .getPublicUrl(filePath);

    return NextResponse.json({ url: publicUrlData.publicUrl }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno no servidor.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
