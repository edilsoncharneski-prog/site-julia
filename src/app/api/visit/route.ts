import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase-admin';

const BOT_UA_REGEX =
  /bot|crawler|spider|slurp|googlebot|bingbot|yandex|baiduspider|facebookexternalhit|whatsapp|headlesschrome|lighthouse/i;

export interface SiteVisitStats {
  total: number;
  daily: Record<string, number>;
  updatedAt?: string;
}

function getTodayKey(): string {
  // Fuso horário de Mato Grosso (America/Cuiaba, UTC-4)
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Cuiaba',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

export function parseVisitStats(raw?: string | null): SiteVisitStats {
  if (!raw) {
    return { total: 0, daily: {} };
  }
  try {
    const parsed = JSON.parse(raw) as Partial<SiteVisitStats>;
    return {
      total: Number(parsed.total) || 0,
      daily:
        parsed.daily && typeof parsed.daily === 'object' ? parsed.daily : {},
      updatedAt: parsed.updatedAt,
    };
  } catch {
    const asNum = Number(raw);
    return {
      total: Number.isFinite(asNum) ? asNum : 0,
      daily: {},
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const ua = request.headers.get('user-agent') || '';
    if (!ua || BOT_UA_REGEX.test(ua)) {
      return NextResponse.json({ ok: true, skipped: 'bot' });
    }

    const admin = getAdminSupabase();
    const { data } = await admin
      .from('configuracoes_loja')
      .select('telefone_fixo')
      .eq('id', 1)
      .maybeSingle();

    const stats = parseVisitStats(data?.telefone_fixo);
    const today = getTodayKey();

    stats.total += 1;
    stats.daily[today] = (stats.daily[today] || 0) + 1;
    stats.updatedAt = new Date().toISOString();

    // Mantém apenas os últimos 40 dias no histórico diário para manter o JSON enxuto
    const sortedDays = Object.keys(stats.daily).sort();
    if (sortedDays.length > 40) {
      const toRemove = sortedDays.slice(0, sortedDays.length - 40);
      for (const day of toRemove) {
        delete stats.daily[day];
      }
    }

    await admin
      .from('configuracoes_loja')
      .update({
        telefone_fixo: JSON.stringify(stats),
      })
      .eq('id', 1);

    return NextResponse.json({ ok: true, total: stats.total });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
