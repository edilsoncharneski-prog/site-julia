'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { getAdminSupabase } from '@/lib/supabase-admin';
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  isAdminAuthenticated,
  validateAdminCredentials,
} from '@/lib/admin-auth';
import type { Disponibilidade, Product } from '@/lib/products';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Sanitiza textos para prevenir XSS e injeção de scripts.
 */
function sanitizeText(value?: string | null, maxLength = 2000): string {
  if (!value) return '';
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, maxLength);
}

function sanitizeHex(value?: string | null, fallback = '#111111'): string {
  const clean = (value || '').trim();
  return /^#[0-9A-Fa-f]{3,6}$/.test(clean) ? clean : fallback;
}

function sanitizeUrl(value?: string | null, fallback = ''): string {
  const clean = (value || '').trim();
  if (!clean) return fallback;
  if (/^(javascript|data|vbscript):/i.test(clean)) return fallback;
  if (clean.startsWith('/') || clean.startsWith('https://')) {
    return clean.slice(0, 500);
  }
  return fallback;
}

function revalidateAllProductPaths(slug?: string) {
  try {
    revalidatePath('/', 'layout');
    revalidatePath('/');
    revalidatePath('/produtos');
    revalidatePath('/admin');
    if (slug) {
      revalidatePath(`/produto/${slug}`);
    }
  } catch (err) {
    console.warn('Erro ao revalidar caminhos:', err);
  }
}

/**
 * Autentica o administrador e grava cookie httpOnly assinado.
 */
export async function loginAdminAction(
  username: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!validateAdminCredentials(username, password)) {
      return {
        success: false,
        error: 'Usuário ou senha inválidos.',
      };
    }

    const token = await createAdminSessionToken(username.trim());
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

/**
 * Encerra a sessão administrativa.
 */
export async function logoutAdminAction(): Promise<{ success: boolean }> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_SESSION_COOKIE);
    return { success: true };
  } catch {
    return { success: false };
  }
}

/**
 * Alterna a disponibilidade de uma variação em tempo real.
 */
export async function toggleVariationAvailabilityAction(
  variationId: string | undefined,
  currentStatus: Disponibilidade,
  fallbackContext?: { productSlug?: string; colorName?: string }
): Promise<{
  success: boolean;
  newStatus?: Disponibilidade;
  variationId?: string;
  error?: string;
}> {
  try {
    if (!(await isAdminAuthenticated())) {
      return { success: false, error: 'Sessão expirada. Faça login novamente.' };
    }

    const admin = getAdminSupabase();
    const newStatus: Disponibilidade =
      currentStatus === 'pronta_entrega' ? 'sob_pedido' : 'pronta_entrega';
    const now = new Date().toISOString();

    let updatedRow: { id: string; disponibilidade: string } | null = null;

    if (variationId && UUID_REGEX.test(variationId)) {
      const { data, error } = await admin
        .from('produto_variacoes')
        .update({
          disponibilidade: newStatus,
          updated_at: now,
        })
        .eq('id', variationId)
        .select('id, disponibilidade')
        .maybeSingle();

      if (error) {
        console.error('Erro ao atualizar variação por ID:', error);
        return { success: false, error: error.message };
      }
      updatedRow = data;
    }

    // Fallback por slug do produto + nome da cor caso o ID não tenha casado
    if (!updatedRow && fallbackContext?.productSlug && fallbackContext?.colorName) {
      const { data: prodRow } = await admin
        .from('produtos')
        .select('id')
        .eq('slug', fallbackContext.productSlug)
        .maybeSingle();

      if (prodRow?.id) {
        const { data, error } = await admin
          .from('produto_variacoes')
          .update({
            disponibilidade: newStatus,
            updated_at: now,
          })
          .eq('produto_id', prodRow.id)
          .eq('nome', fallbackContext.colorName)
          .select('id, disponibilidade')
          .maybeSingle();

        if (error) {
          console.error('Erro ao atualizar variação por (produto_id, nome):', error);
          return { success: false, error: error.message };
        }
        updatedRow = data;
      }
    }

    if (!updatedRow) {
      return {
        success: false,
        error: 'Variação não localizada para atualização.',
      };
    }

    revalidateAllProductPaths(fallbackContext?.productSlug);
    return {
      success: true,
      newStatus: updatedRow.disponibilidade as Disponibilidade,
      variationId: updatedRow.id,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Falha em toggleVariationAvailabilityAction:', msg);
    return { success: false, error: msg };
  }
}

/**
 * Salva as alterações de um produto existente ou insere um novo produto,
 * sincronizando suas variações de cores.
 */
export async function saveProductToSupabaseAction(product: Product): Promise<{
  success: boolean;
  productId?: string;
  error?: string;
}> {
  try {
    if (!(await isAdminAuthenticated())) {
      return { success: false, error: 'Sessão expirada. Faça login novamente.' };
    }

    const admin = getAdminSupabase();

    const cleanTitulo = sanitizeText(product.titulo, 180);
    const cleanNome = sanitizeText(product.nome || product.titulo, 150);
    const cleanSlug = sanitizeText(product.slug, 180)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (!cleanTitulo || !cleanSlug) {
      return { success: false, error: 'Título e identificador do produto são obrigatórios.' };
    }

    const productPayload = {
      titulo: cleanTitulo,
      nome: cleanNome,
      slug: cleanSlug,
      descricao: sanitizeText(product.descricao, 4000) || null,
      tagline: sanitizeText(product.tagline, 200) || null,
      preco: product.preco ?? null,
      preco_promocional: product.preco_promocional ?? null,
      exibir_preco: Boolean(product.exibir_preco),
      destaque: Boolean(product.destaque),
      dispensa_cnh: product.dispensa_cnh ?? true,
      potencia_motor: sanitizeText(product.potencia_motor, 80) || null,
      tipo_bateria: sanitizeText(product.tipo_bateria, 100) || null,
      autonomia: sanitizeText(product.autonomia, 80) || null,
      velocidade_maxima: sanitizeText(product.velocidade_maxima, 80) || null,
      capacidade_carga: sanitizeText(product.capacidade_carga, 80) || null,
      tempo_recarga: sanitizeText(product.tempo_recarga, 80) || null,
      imagem_capa: sanitizeUrl(product.imagem_capa, '/logo.png') || null,
      video_url: sanitizeUrl(product.video_url, '') || null,
      updated_at: new Date().toISOString(),
    };

    let targetProductId = product.id;
    const isUUID = UUID_REGEX.test(product.id || '');

    // Se não for UUID, verifica se já existe pelo slug
    if (!isUUID) {
      const { data: existingBySlug } = await admin
        .from('produtos')
        .select('id')
        .eq('slug', cleanSlug)
        .maybeSingle();

      if (existingBySlug?.id) {
        targetProductId = existingBySlug.id;
      }
    }

    if (UUID_REGEX.test(targetProductId || '')) {
      const { error: updateErr } = await admin
        .from('produtos')
        .update(productPayload)
        .eq('id', targetProductId);

      if (updateErr) {
        console.error('Erro ao atualizar produto:', updateErr);
        return { success: false, error: updateErr.message };
      }
    } else {
      const { data: inserted, error: insertErr } = await admin
        .from('produtos')
        .insert({
          ...productPayload,
          categoria_id: 'c4edb520-af3a-4e66-bf20-33f4a2561aef',
          status: 'publicado',
        })
        .select('id')
        .single();

      if (insertErr || !inserted) {
        console.error('Erro ao inserir produto:', insertErr);
        return { success: false, error: insertErr?.message || 'Falha ao cadastrar produto' };
      }
      targetProductId = inserted.id;
    }

    // Sincronizar variações de cores com upsert seguro por (produto_id, nome)
    if (product.cores && product.cores.length > 0) {
      for (let i = 0; i < product.cores.length; i++) {
        const color = product.cores[i];
        const cleanColorName = sanitizeText(color.nome, 80) || `Cor ${i + 1}`;
        const varPayload = {
          produto_id: targetProductId,
          nome: cleanColorName,
          hex: sanitizeHex(color.hex, '#111111'),
          hex_secundario: color.hex_secundario
            ? sanitizeHex(color.hex_secundario, '#444444')
            : null,
          imagem: sanitizeUrl(color.imagem, '/logo.png'),
          disponibilidade:
            color.disponibilidade === 'pronta_entrega' ? 'pronta_entrega' : 'sob_pedido',
          slug_legado: sanitizeText(color.slug_legado, 180) || null,
          ordem: i,
          updated_at: new Date().toISOString(),
        };

        if (color.id && UUID_REGEX.test(color.id)) {
          const { error: vUpdateErr } = await admin
            .from('produto_variacoes')
            .update(varPayload)
            .eq('id', color.id);

          if (vUpdateErr) {
            await admin
              .from('produto_variacoes')
              .upsert(varPayload, { onConflict: 'produto_id,nome' });
          }
        } else {
          await admin
            .from('produto_variacoes')
            .upsert(varPayload, { onConflict: 'produto_id,nome' });
        }
      }
    }

    revalidateAllProductPaths(cleanSlug);
    return { success: true, productId: targetProductId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Falha em saveProductToSupabaseAction:', msg);
    return { success: false, error: msg };
  }
}

/**
 * Alterna o status de destaque de um produto.
 */
export async function toggleProductDestaqueAction(
  productId: string,
  destaque: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!(await isAdminAuthenticated())) {
      return { success: false, error: 'Sessão expirada. Faça login novamente.' };
    }

    const admin = getAdminSupabase();
    const { error } = await admin
      .from('produtos')
      .update({ destaque: Boolean(destaque), updated_at: new Date().toISOString() })
      .eq('id', productId);

    if (error) {
      console.error('Erro ao alternar destaque:', error);
      return { success: false, error: error.message };
    }

    revalidateAllProductPaths();
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

/**
 * Remove um produto e suas variações.
 */
export async function deleteProductFromSupabaseAction(
  productId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!(await isAdminAuthenticated())) {
      return { success: false, error: 'Sessão expirada. Faça login novamente.' };
    }

    const admin = getAdminSupabase();

    await admin.from('produto_variacoes').delete().eq('produto_id', productId);

    const { error } = await admin.from('produtos').delete().eq('id', productId);

    if (error) {
      console.error('Erro ao excluir produto:', error);
      return { success: false, error: error.message };
    }

    revalidateAllProductPaths();
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

/**
 * Salva as informações de atendimento da loja (WhatsApp e Endereço).
 */
export async function saveStoreConfigAction(config: {
  whatsapp: string;
  endereco: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (!(await isAdminAuthenticated())) {
      return { success: false, error: 'Sessão expirada. Faça login novamente.' };
    }

    const cleanWhatsapp = sanitizeText(config.whatsapp, 30).replace(/[^\d+]/g, '');
    const cleanEndereco = sanitizeText(config.endereco, 300);

    const admin = getAdminSupabase();
    const { error } = await admin
      .from('configuracoes_loja')
      .update({
        whatsapp_principal: cleanWhatsapp,
        endereco_completo: cleanEndereco,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1);

    if (error) {
      console.error('Erro ao salvar configurações:', error);
      return { success: false, error: error.message };
    }

    revalidateAllProductPaths();
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

/**
 * Busca as configurações da loja.
 */
export async function getStoreConfigAction(): Promise<{
  whatsapp: string;
  endereco: string;
}> {
  try {
    const admin = getAdminSupabase();
    const { data } = await admin
      .from('configuracoes_loja')
      .select('whatsapp_principal, endereco_completo')
      .eq('id', 1)
      .single();

    return {
      whatsapp: data?.whatsapp_principal || '5566984202988',
      endereco:
        data?.endereco_completo ||
        'Avenida Tamburello, ao lado do Sicoob - Cotriguaçu/MT',
    };
  } catch {
    return {
      whatsapp: '5566984202988',
      endereco: 'Avenida Tamburello, ao lado do Sicoob - Cotriguaçu/MT',
    };
  }
}
