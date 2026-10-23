'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  Image as ImageIcon,
  Settings,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Zap,
  Save,
  Search,
  Palette,
  Clock,
  Truck,
  Video,
  Loader2,
  LogOut,
  Home,
} from 'lucide-react';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import {
  disponibilidadeLabels,
  getProductColors,
  type Disponibilidade,
  type Product,
  type ProductColor,
} from '@/lib/products';
import {
  toggleVariationAvailabilityAction,
  saveProductToSupabaseAction,
  toggleProductDestaqueAction,
  deleteProductFromSupabaseAction,
  saveStoreConfigAction,
  logoutAdminAction,
} from './actions';

function emptyColor(): ProductColor {
  return {
    nome: 'Nova cor',
    hex: '#111111',
    imagem: '',
    disponibilidade: 'sob_pedido',
  };
}

interface AdminClientProps {
  initialProducts: Product[];
  initialConfig: {
    whatsapp: string;
    endereco: string;
  };
}

export function AdminClient({ initialProducts, initialConfig }: AdminClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'produtos' | 'banners' | 'configuracoes'>('produtos');
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isError?: boolean } | null>(null);

  // Formulário do produto
  const [formTitulo, setFormTitulo] = useState('');
  const [formMotor, setFormMotor] = useState('1000W');
  const [formBateria, setFormBateria] = useState('Lítio 60V 20Ah');
  const [formAutonomia, setFormAutonomia] = useState('Até 50 km');
  const [formVelocidade, setFormVelocidade] = useState('32 km/h');
  const [formPreco, setFormPreco] = useState('');
  const [formExibirPreco, setFormExibirPreco] = useState(false);
  const [formDestaque, setFormDestaque] = useState(true);
  const [formDispensaCnh, setFormDispensaCnh] = useState(true);
  const [formDescricao, setFormDescricao] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formCores, setFormCores] = useState<ProductColor[]>([emptyColor()]);

  // Configurações da Loja
  const [whatsapp, setWhatsapp] = useState(initialConfig.whatsapp);
  const [endereco, setEndereco] = useState(initialConfig.endereco);
  const [configSaved, setConfigSaved] = useState(false);

  const showToast = (text: string, isError = false) => {
    setFeedback({ text, isError });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleLogout = async () => {
    await logoutAdminAction();
    router.push('/admin/login');
    router.refresh();
  };

  const handleOpenNew = () => {
    setEditingProduct(null);
    setFormTitulo('');
    setFormMotor('1000W');
    setFormBateria('Lítio 60V 20Ah');
    setFormAutonomia('Até 50 km');
    setFormVelocidade('32 km/h');
    setFormPreco('');
    setFormExibirPreco(false);
    setFormDestaque(true);
    setFormDispensaCnh(true);
    setFormDescricao('');
    setFormVideoUrl('');
    setFormCores([emptyColor()]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormTitulo(p.titulo);
    setFormMotor(p.potencia_motor || '1000W');
    setFormBateria(p.tipo_bateria || '');
    setFormAutonomia(p.autonomia || '');
    setFormVelocidade(p.velocidade_maxima || '32 km/h');
    setFormPreco(p.preco ? p.preco.toString() : '');
    setFormExibirPreco(p.exibir_preco || false);
    setFormDestaque(p.destaque || false);
    setFormDispensaCnh(p.dispensa_cnh !== false);
    setFormDescricao(p.descricao || '');
    setFormVideoUrl(p.video_url || '');
    setFormCores(
      getProductColors(p).map((color) => ({
        ...color,
        disponibilidade: color.disponibilidade || 'sob_pedido',
      }))
    );
    setIsModalOpen(true);
  };

  const updateColor = <K extends keyof ProductColor>(
    index: number,
    field: K,
    value: ProductColor[K]
  ) => {
    setFormCores((colors) =>
      colors.map((color, i) => (i === index ? { ...color, [field]: value } : color))
    );
  };

  const addColor = () => {
    setFormCores((colors) => [...colors, emptyColor()]);
  };

  const removeColor = (index: number) => {
    setFormCores((colors) => {
      if (colors.length === 1) return colors;
      return colors.filter((_, i) => i !== index);
    });
  };

  const toggleColorAvailability = async (index: number) => {
    const targetColor = formCores[index];
    if (!targetColor) return;

    const currentStatus = targetColor.disponibilidade;
    const nextStatus: Disponibilidade =
      currentStatus === 'pronta_entrega' ? 'sob_pedido' : 'pronta_entrega';

    setFormCores((colors) =>
      colors.map((color, i) =>
        i === index ? { ...color, disponibilidade: nextStatus } : color
      )
    );

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== editingProduct.id) return p;
          const newColors = getProductColors(p).map((c, i) =>
            i === index ? { ...c, disponibilidade: nextStatus } : c
          );
          return { ...p, cores: newColors };
        })
      );

      const res = await toggleVariationAvailabilityAction(
        targetColor.id,
        currentStatus,
        {
          productSlug: editingProduct.slug,
          colorName: targetColor.nome,
        }
      );

      if (res.success) {
        showToast(
          `Cor "${targetColor.nome}" atualizada para ${disponibilidadeLabels[nextStatus]}!`
        );
        router.refresh();
      } else {
        showToast(res.error || 'Erro ao atualizar disponibilidade.', true);
      }
    }
  };

  // Alternância rápida na tabela com atualização em tempo real
  const handleQuickToggle = async (productId: string, colorIndex: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const colors = getProductColors(product);
    const targetColor = colors[colorIndex];
    if (!targetColor) return;

    const currentStatus = targetColor.disponibilidade;
    const nextStatus: Disponibilidade =
      currentStatus === 'pronta_entrega' ? 'sob_pedido' : 'pronta_entrega';

    // Atualização otimista imediata na interface
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const newColors = getProductColors(p).map((c, i) =>
          i === colorIndex ? { ...c, disponibilidade: nextStatus } : c
        );
        return { ...p, cores: newColors };
      })
    );

    const res = await toggleVariationAvailabilityAction(
      targetColor.id,
      currentStatus,
      {
        productSlug: product.slug,
        colorName: targetColor.nome,
      }
    );

    if (res.success) {
      if (res.variationId && !targetColor.id) {
        setProducts((prev) =>
          prev.map((p) => {
            if (p.id !== productId) return p;
            const newColors = getProductColors(p).map((c, i) =>
              i === colorIndex ? { ...c, id: res.variationId } : c
            );
            return { ...p, cores: newColors };
          })
        );
      }
      showToast(
        `Cor "${targetColor.nome}" atualizada para ${disponibilidadeLabels[nextStatus]}!`
      );
      router.refresh();
    } else {
      // Reverte estado otimista em caso de erro
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== productId) return p;
          const revertedColors = getProductColors(p).map((c, i) =>
            i === colorIndex ? { ...c, disponibilidade: currentStatus } : c
          );
          return { ...p, cores: revertedColors };
        })
      );
      showToast(`Erro ao atualizar: ${res.error || 'Falha na conexão'}`, true);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir permanentemente este veículo?')) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      const res = await deleteProductFromSupabaseAction(id);
      if (res.success) {
        showToast('Veículo removido com sucesso.');
        router.refresh();
      } else {
        showToast(`Erro ao excluir: ${res.error || 'Tente novamente'}`, true);
      }
    }
  };

  const handleToggleDestaque = async (id: string) => {
    const p = products.find((item) => item.id === id);
    if (!p) return;
    const newDestaque = !p.destaque;

    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, destaque: newDestaque } : item))
    );

    const res = await toggleProductDestaqueAction(id, newDestaque);
    if (res.success) {
      showToast(`Destaque ${newDestaque ? 'ativado' : 'desativado'}!`);
      router.refresh();
    } else {
      showToast(res.error || 'Erro ao atualizar destaque.', true);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitulo.trim()) return;

    setIsSaving(true);

    const slug = formTitulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const cores = formCores
      .map((color) => ({
        ...color,
        nome: color.nome.trim() || 'Padrão',
        imagem: color.imagem.trim() || '/logo.png',
        disponibilidade: color.disponibilidade || 'sob_pedido',
      }))
      .slice(0, 16);
    const imagemCapa = cores[0]?.imagem;

    const updatedProd: Product = {
      id: editingProduct ? editingProduct.id : Date.now().toString(),
      nome: editingProduct?.nome || formTitulo.trim(),
      emoji: editingProduct?.emoji || '🛵',
      titulo: formTitulo.trim(),
      slug: editingProduct?.slug || slug,
      categoria: editingProduct?.categoria || 'Scooter',
      categoria_slug: editingProduct?.categoria_slug || 'autopropelidos',
      descricao: formDescricao.trim(),
      preco: formPreco ? parseFloat(formPreco) : null,
      exibir_preco: formExibirPreco,
      destaque: formDestaque,
      dispensa_cnh: formDispensaCnh,
      potencia_motor: formMotor.trim(),
      tipo_bateria: formBateria.trim(),
      autonomia: formAutonomia.trim(),
      velocidade_maxima: formVelocidade.trim(),
      capacidade_carga: editingProduct?.capacidade_carga || '150 kg',
      tempo_recarga: editingProduct?.tempo_recarga || '6 a 8 horas',
      imagem_capa: imagemCapa,
      video_url: formVideoUrl.trim() || null,
      cores,
    };

    const res = await saveProductToSupabaseAction(updatedProd);

    setIsSaving(false);

    if (res.success) {
      const finalProd = {
        ...updatedProd,
        id: res.productId || updatedProd.id,
      };

      if (editingProduct) {
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? finalProd : p)));
      } else {
        setProducts((prev) => [finalProd, ...prev]);
      }

      setIsModalOpen(false);
      showToast('Alterações salvas com sucesso!');
      router.refresh();
    } else {
      showToast(`Erro ao salvar: ${res.error || 'Verifique sua conexão.'}`, true);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await saveStoreConfigAction({ whatsapp, endereco });
    setIsSaving(false);
    if (res.success) {
      setConfigSaved(true);
      setTimeout(() => setConfigSaved(false), 3000);
      showToast('Configurações salvas com sucesso!');
      router.refresh();
    } else {
      showToast(`Erro ao salvar configurações: ${res.error}`, true);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Notification */}
      {feedback && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-xs font-medium text-white shadow-xl animate-fade-in ${
            feedback.isError ? 'bg-red-600' : 'bg-gray-950'
          }`}
        >
          {feedback.isError ? (
            <XCircle className="h-4 w-4 text-white" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Abas Superiores e Ações de Sessão */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('produtos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
              activeTab === 'produtos'
                ? 'bg-gray-900 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Package className="w-4 h-4" />
            Produtos & Veículos ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('banners')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
              activeTab === 'banners'
                ? 'bg-gray-900 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Banners da Home
          </button>

          <button
            onClick={() => setActiveTab('configuracoes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
              activeTab === 'configuracoes'
                ? 'bg-gray-900 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            Ajustes da Loja
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-950 transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            Início
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair
          </button>
        </div>
      </div>

      {/* ABA: PRODUTOS */}
      {activeTab === 'produtos' && (
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-[11px] leading-relaxed text-emerald-950 flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
            <div>
              <strong>Atualização Instantânea:</strong> Clique nos botões de cor abaixo
              (<strong>Pronta</strong> / <strong>Pedido</strong>) para alternar a disponibilidade
              e atualizar imediatamente a vitrine para os clientes.
            </div>
          </div>

          {/* Barra de Ações: Busca e Botão Novo */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Buscar veículo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-hidden focus:border-gray-400"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>

            <button
              onClick={handleOpenNew}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm px-4 py-2.5 rounded-lg shadow-xs hover:shadow-md transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              Adicionar Novo Veículo
            </button>
          </div>

          {/* Lista de Produtos */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 text-xs uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Veículo</th>
                    <th className="py-3 px-4">Especificações</th>
                    <th className="py-3 px-4">Preço / Visibilidade</th>
                    <th className="py-3 px-4">Vídeo</th>
                    <th className="py-3 px-4">Disponibilidade por cor</th>
                    <th className="py-3 px-4 text-center">Destaque</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-gray-900 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden relative">
                          {p.cores?.[0]?.imagem || p.imagem_capa ? (
                            <Image
                              src={p.cores?.[0]?.imagem || p.imagem_capa || ''}
                              alt={p.titulo}
                              fill
                              className="object-contain p-1"
                            />
                          ) : (
                            <Zap className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm leading-tight">
                            {p.nome || p.titulo}
                          </div>
                          <span className="text-[11px] text-gray-400">
                            {p.cores?.length || 1} cor(es) • slug: {p.slug}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs">
                        <div className="text-gray-800 font-medium">{p.potencia_motor} • {p.tipo_bateria}</div>
                        <div className="text-gray-500 text-[11px]">Autonomia: {p.autonomia}</div>
                        <div className="mt-1.5 flex items-center gap-1">
                          {(p.cores || []).map((color) => (
                            <span
                              key={`${p.id}-${color.nome}`}
                              title={color.nome}
                              className="h-3 w-3 rounded-full border border-gray-300"
                              style={{ backgroundColor: color.hex }}
                            />
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs">
                        {p.exibir_preco && p.preco ? (
                          <div className="font-bold text-emerald-700">
                            {formatCurrency(p.preco)}
                          </div>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[11px] font-medium">
                            Sob consulta WhatsApp
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-xs">
                        {p.video_url ? (
                          <span
                            title={p.video_url}
                            className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700 border border-blue-200"
                          >
                            <Video className="h-3 w-3" /> Drive
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-400">Sem vídeo</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex max-w-[290px] flex-wrap gap-1.5">
                          {getProductColors(p).map((color, index) => {
                            const isProntaEntrega =
                              color.disponibilidade === 'pronta_entrega';

                            return (
                              <button
                                key={`${p.id}-${color.nome}-${index}`}
                                type="button"
                                onClick={() => handleQuickToggle(p.id, index)}
                                title={`${color.nome}: ${disponibilidadeLabels[color.disponibilidade]}. Clique para alternar.`}
                                className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold transition-all ${
                                  isProntaEntrega
                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 shadow-2xs'
                                    : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'
                                }`}
                              >
                                <span
                                  className="h-2.5 w-2.5 rounded-full border border-black/10"
                                  style={{ backgroundColor: color.hex }}
                                />
                                <span className="max-w-[85px] truncate">
                                  {color.nome}
                                </span>
                                <span className="uppercase tracking-wide font-bold">
                                  {isProntaEntrega ? 'Pronta' : 'Pedido'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleDestaque(p.id)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                            p.destaque
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {p.destaque ? '★ Destaque' : 'Normal'}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-400">
                        Nenhum veículo encontrado com este nome.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ABA: BANNERS */}
      {activeTab === 'banners' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs">
          <h3 className="font-bold text-base text-gray-900 mb-2">Banners da Tela Inicial</h3>
          <p className="text-xs text-gray-500 mb-6">
            Altere ou adicione novos avisos, promoções e comunicados exibidos no topo do site.
          </p>
          <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl text-center text-gray-500 flex flex-col items-center justify-center">
            <ImageIcon className="w-10 h-10 text-gray-300 mb-2" />
            <p className="text-sm font-medium">Banners em exibição automática (Padrão)</p>
            <p className="text-xs text-gray-400 mt-1">
              Os avisos de &quot;Até 21x no Cartão&quot; e &quot;Sem CNH&quot; já estão ativos e responsivos.
            </p>
          </div>
        </div>
      )}

      {/* ABA: CONFIGURAÇÕES */}
      {activeTab === 'configuracoes' && (
        <form
          onSubmit={handleSaveConfig}
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs max-w-2xl flex flex-col gap-4"
        >
          <div>
            <h3 className="font-bold text-base text-gray-900">Configurações Gerais da Loja</h3>
            <p className="text-xs text-gray-500">
              Atualize os dados de atendimento e localização da loja.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              WhatsApp Principal de Vendas (com DDD e código do país)
            </label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-hidden focus:border-gray-500"
              placeholder="Ex: 5566984202988"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Endereço Físico Completo
            </label>
            <input
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-hidden focus:border-gray-500"
              placeholder="Ex: Avenida Tamburello, ao lado do Sicoob - Cotriguaçu/MT"
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white font-bold text-sm px-5 py-2.5 rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar Alterações
            </button>
            {configSaved && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Salvo com sucesso!
              </span>
            )}
          </div>
        </form>
      )}

      {/* MODAL: CRIAR / EDITAR PRODUTO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-gray-900">
                  {editingProduct ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="flex flex-col gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nome do Modelo / Título *
                </label>
                <input
                  type="text"
                  required
                  value={formTitulo}
                  onChange={(e) => setFormTitulo(e.target.value)}
                  placeholder="Ex: Scooter Elétrica Cappuccino 1000W"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-hidden focus:border-gray-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Potência do Motor
                  </label>
                  <input
                    type="text"
                    value={formMotor}
                    onChange={(e) => setFormMotor(e.target.value)}
                    placeholder="Ex: 1000W"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-hidden focus:border-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Bateria
                  </label>
                  <input
                    type="text"
                    value={formBateria}
                    onChange={(e) => setFormBateria(e.target.value)}
                    placeholder="Ex: Lítio 60V"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-hidden focus:border-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Autonomia
                  </label>
                  <input
                    type="text"
                    value={formAutonomia}
                    onChange={(e) => setFormAutonomia(e.target.value)}
                    placeholder="Ex: Até 50 km"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-hidden focus:border-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Velocidade Máx.
                  </label>
                  <input
                    type="text"
                    value={formVelocidade}
                    onChange={(e) => setFormVelocidade(e.target.value)}
                    placeholder="Ex: 32 km/h"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-hidden focus:border-gray-500"
                  />
                </div>
              </div>

              {/* VÍDEO GOOGLE DRIVE */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <Video className="w-4 h-4 text-blue-700" />
                  <label className="text-xs font-bold text-blue-950">
                    Vídeo de Apresentação (Google Drive)
                  </label>
                </div>
                <input
                  type="text"
                  value={formVideoUrl}
                  onChange={(e) => setFormVideoUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/1XyZ.../view ou ID do arquivo"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-blue-200 bg-white focus:outline-hidden focus:border-blue-500 text-gray-900"
                />
                <p className="mt-1 text-[11px] text-blue-800 leading-relaxed">
                  O link é automaticamente convertido para o formato responsivo <code>/preview</code> e embutido na página do produto.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-2">
                    <Palette className="mt-0.5 h-4 w-4 text-emerald-600" />
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">
                        Cores e disponibilidade
                      </h4>
                      <p className="text-[11px] leading-relaxed text-gray-500">
                        A primeira cor é a capa do card. As alterações são atualizadas em tempo real.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addColor}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-[11px] font-semibold text-gray-700 transition-colors hover:border-gray-900 hover:text-gray-950"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar cor
                  </button>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  {formCores.map((color, index) => {
                    const isProntaEntrega =
                      color.disponibilidade === 'pronta_entrega';

                    return (
                      <div
                        key={index}
                        className="rounded-lg border border-gray-200 bg-white p-3"
                      >
                        <div className="flex flex-wrap items-end gap-3">
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className="h-9 w-9 rounded-full border border-gray-300"
                              style={{ backgroundColor: color.hex }}
                            />
                            <span className="text-[9px] text-gray-400">
                              {index === 0 ? 'Capa' : `#${index + 1}`}
                            </span>
                          </div>

                          <div className="min-w-[150px] flex-1">
                            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                              Nome da cor
                            </label>
                            <input
                              type="text"
                              value={color.nome}
                              onChange={(e) =>
                                updateColor(index, 'nome', e.target.value)
                              }
                              placeholder="Ex: Azul"
                              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-500 focus:outline-hidden"
                            />
                          </div>

                          <div className="w-[125px]">
                            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                              Cor (hex)
                            </label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="color"
                                value={color.hex}
                                onChange={(e) =>
                                  updateColor(index, 'hex', e.target.value)
                                }
                                className="h-9 w-9 cursor-pointer rounded border border-gray-200 bg-white p-0.5"
                                aria-label={`Selecionar cor ${color.nome}`}
                              />
                              <input
                                type="text"
                                value={color.hex}
                                onChange={(e) =>
                                  updateColor(index, 'hex', e.target.value)
                                }
                                className="w-[78px] rounded-lg border border-gray-200 px-2 py-2 text-xs focus:border-gray-500 focus:outline-hidden"
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleColorAvailability(index)}
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-semibold transition-colors ${
                              isProntaEntrega
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold'
                                : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                            aria-pressed={isProntaEntrega}
                          >
                            {isProntaEntrega ? (
                              <Truck className="h-3.5 w-3.5" />
                            ) : (
                              <Clock className="h-3.5 w-3.5" />
                            )}
                            {disponibilidadeLabels[color.disponibilidade]}
                          </button>

                          <button
                            type="button"
                            onClick={() => removeColor(index)}
                            disabled={formCores.length === 1}
                            className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                            title="Remover cor"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-3">
                          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                            URL da imagem desta cor
                          </label>
                          <input
                            type="text"
                            value={color.imagem}
                            onChange={(e) =>
                              updateColor(index, 'imagem', e.target.value)
                            }
                            placeholder="/motos/modelo-cor.webp ou https://..."
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:border-gray-500 focus:outline-hidden"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Preço (R$) - Opcional
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formPreco}
                    onChange={(e) => setFormPreco(e.target.value)}
                    placeholder="Ex: 9890.00"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white"
                  />
                </div>

                <div className="flex flex-col gap-2 justify-center">
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formExibirPreco}
                      onChange={(e) => setFormExibirPreco(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    Exibir Preço no Card (Se desmarcado, fica &apos;Sob Consulta&apos;)
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formDestaque}
                      onChange={(e) => setFormDestaque(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    Destacar na Página Inicial
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formDispensaCnh}
                      onChange={(e) => setFormDispensaCnh(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    Exibir Selo &quot;Sem CNH (CONTRAN 996/23)&quot;
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Descrição Completa
                </label>
                <textarea
                  rows={3}
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  placeholder="Detalhes, itens de série, cores disponíveis..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-hidden focus:border-gray-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-[#25D366] hover:bg-[#20ba59] text-white rounded-lg shadow-xs transition-colors disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
