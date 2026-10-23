'use server';

import { revalidatePath } from 'next/cache';
import { getAdminSupabase } from '@/lib/supabase-admin';
import type { Disponibilidade, Product, ProductColor } from '@/lib/products';

function revalidateAllProductPaths(slug?: string) {
  try {
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
 * Alterna a disponibilidade de uma variação diretamente no Supabase.
 */
export async function toggleVariationAvailabilityAction(
  variationId: string,
  currentStatus: Disponibilidade
): Promise<{ success: boolean; newStatus?: Disponibilidade; error?: string }> {
  try {
    const admin = getAdminSupabase();
    const newStatus: Disponibilidade =
      currentStatus === 'pronta_entrega' ? 'sob_pedido' : 'pronta_entrega';

    const { error } = await admin
      .from('produto_variacoes')
      .update({
        disponibilidade: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', variationId);

    if (error) {
      console.error('Erro ao atualizar variação no Supabase:', error);
      return { success: false, error: error.message };
    }

    revalidateAllProductPaths();
    return { success: true, newStatus };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Falha na Server Action toggleVariationAvailabilityAction:', msg);
    return { success: false, error: msg };
  }
}

/**
 * Salva as alterações de um produto existente ou insere um novo produto
 * diretamente no Supabase, sincronizando suas variações de cores.
 */
export async function saveProductToSupabaseAction(product: Product): Promise<{
  success: boolean;
  productId?: string;
  error?: string;
}> {
  try {
    const admin = getAdminSupabase();

    const productPayload = {
      titulo: product.titulo,
      nome: product.nome || product.titulo,
      slug: product.slug,
      descricao: product.descricao || null,
      tagline: product.tagline || null,
      preco: product.preco ?? null,
      preco_promocional: product.preco_promocional ?? null,
      exibir_preco: Boolean(product.exibir_preco),
      destaque: Boolean(product.destaque),
      dispensa_cnh: product.dispensa_cnh ?? true,
      potencia_motor: product.potencia_motor || null,
      tipo_bateria: product.tipo_bateria || null,
      autonomia: product.autonomia || null,
      velocidade_maxima: product.velocidade_maxima || null,
      capacidade_carga: product.capacidade_carga || null,
      tempo_recarga: product.tempo_recarga || null,
      imagem_capa: product.imagem_capa || null,
      video_url: product.video_url?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    let targetProductId = product.id;

    // Se o ID for UUID válido, atualiza; senão, insere
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      product.id
    );

    if (isUUID) {
      const { error: updateErr } = await admin
        .from('produtos')
        .update(productPayload)
        .eq('id', product.id);

      if (updateErr) {
        console.error('Erro ao atualizar produto no Supabase:', updateErr);
        return { success: false, error: updateErr.message };
      }
    } else {
      const { data: inserted, error: insertErr } = await admin
        .from('produtos')
        .insert({
          ...productPayload,
          categoria_id: 'c4edb520-af3a-4e66-bf20-33f4a2561aef', // Autopropelidos por padrão
          status: 'ativo',
        })
        .select('id')
        .single();

      if (insertErr || !inserted) {
        console.error('Erro ao inserir produto no Supabase:', insertErr);
        return { success: false, error: insertErr?.message || 'Falha ao inserir' };
      }
      targetProductId = inserted.id;
    }

    // Sincronizar variações de cores
    if (product.cores && product.cores.length > 0) {
      for (let i = 0; i < product.cores.length; i++) {
        const color = product.cores[i];
        const isColorUUID =
          color.id &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(color.id);

        const varPayload = {
          produto_id: targetProductId,
          nome: color.nome.trim() || 'Padrão',
          hex: color.hex.trim() || '#111111',
          hex_secundario: color.hex_secundario || null,
          imagem: color.imagem.trim() || '/logo.png',
          disponibilidade: color.disponibilidade || 'sob_pedido',
          slug_legado: color.slug_legado || null,
          ordem: i,
          updated_at: new Date().toISOString(),
        };

        if (isColorUUID && color.id) {
          await admin
            .from('produto_variacoes')
            .update(varPayload)
            .eq('id', color.id);
        } else {
          await admin.from('produto_variacoes').insert(varPayload);
        }
      }
    }

    revalidateAllProductPaths(product.slug);
    return { success: true, productId: targetProductId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Falha na Server Action saveProductToSupabaseAction:', msg);
    return { success: false, error: msg };
  }
}

/**
 * Alterna o status de destaque de um produto no Supabase.
 */
export async function toggleProductDestaqueAction(
  productId: string,
  destaque: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = getAdminSupabase();
    const { error } = await admin
      .from('produtos')
      .update({ destaque, updated_at: new Date().toISOString() })
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
 * Remove um produto e suas variações do banco de dados do Supabase.
 */
export async function deleteProductFromSupabaseAction(
  productId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = getAdminSupabase();

    // 1. Remove as variações vinculadas
    await admin.from('produto_variacoes').delete().eq('produto_id', productId);

    // 2. Remove o produto
    const { error } = await admin.from('produtos').delete().eq('id', productId);

    if (error) {
      console.error('Erro ao deletar produto do Supabase:', error);
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
 * Salva as informações da loja (WhatsApp e Endereço) no Supabase.
 */
export async function saveStoreConfigAction(config: {
  whatsapp: string;
  endereco: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = getAdminSupabase();
    const { error } = await admin
      .from('configuracoes_loja')
      .update({
        whatsapp_principal: config.whatsapp.trim(),
        endereco_completo: config.endereco.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1);

    if (error) {
      console.error('Erro ao salvar configuracoes_loja no Supabase:', error);
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
 * Busca as configurações da loja do Supabase.
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
