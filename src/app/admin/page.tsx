'use client';

import { useState, useEffect } from 'react';
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
import initialProductsData from '@/data/produtos-loja.json';

const INITIAL_MOCK_PRODUCTS: Product[] = initialProductsData as Product[];
const STORAGE_KEY = 'eletrosom_admin_products_v2';

function emptyColor(): ProductColor {
  return {
    nome: 'Nova cor',
    hex: '#111111',
    imagem: '',
    disponibilidade: 'sob_pedido',
  };
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'produtos' | 'banners' | 'configuracoes'>('produtos');
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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
  const [formCores, setFormCores] = useState<ProductColor[]>([emptyColor()]);

  // Configurações da Loja
  const [whatsapp, setWhatsapp] = useState('5566984202988');
  const [endereco, setEndereco] = useState('Avenida Tamburello, ao lado do Sicoob - Cotriguaçu/MT');
  const [configSaved, setConfigSaved] = useState(false);

  // Carregar produtos salvos
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProducts(JSON.parse(saved));
      } else {
        setProducts(INITIAL_MOCK_PRODUCTS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_PRODUCTS));
      }

      const savedWp = localStorage.getItem('eletrosom_admin_wp');
      if (savedWp) setWhatsapp(savedWp);

      const savedEnd = localStorage.getItem('eletrosom_admin_end');
      if (savedEnd) setEndereco(savedEnd);
    } catch {
      setProducts(INITIAL_MOCK_PRODUCTS);
    }
  }, []);

  const saveProductsToStorage = (updated: Product[]) => {
    setProducts(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
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

  const toggleColorAvailability = (index: number) => {
    setFormCores((colors) =>
      colors.map((color, i) =>
        i === index
          ? {
              ...color,
              disponibilidade:
                color.disponibilidade === 'pronta_entrega'
                  ? 'sob_pedido'
                  : 'pronta_entrega',
            }
          : color
      )
    );
  };

  const handleQuickToggle = (productId: string, colorIndex: number) => {
    const updated = products.map((product) => {
      if (product.id !== productId) return product;
      const colors = getProductColors(product).map((color, index) =>
        index === colorIndex
          ? {
              ...color,
              disponibilidade:
                color.disponibilidade === 'pronta_entrega'
                  ? ('sob_pedido' as Disponibilidade)
                  : ('pronta_entrega' as Disponibilidade),
            }
          : color
      );
      return { ...product, cores: colors };
    });
    saveProductsToStorage(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este veículo?')) {
      const updated = products.filter((p) => p.id !== id);
      saveProductsToStorage(updated);
    }
  };

  const handleToggleDestaque = (id: string) => {
    const updated = products.map((p) =>
      p.id === id ? { ...p, destaque: !p.destaque } : p
    );
    saveProductsToStorage(updated);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitulo.trim()) return;

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
      .slice(0, 12);
    const imagemCapa = cores[0]?.imagem;

    const newProd: Product = {
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
      cores,
    };

    let updated: Product[];
    if (editingProduct) {
      updated = products.map((p) => (p.id === editingProduct.id ? newProd : p));
    } else {
      updated = [newProd, ...products];
    }

    saveProductsToStorage(updated);
    setIsModalOpen(false);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('eletrosom_admin_wp', whatsapp);
      localStorage.setItem('eletrosom_admin_end', endereco);
      setConfigSaved(true);
      setTimeout(() => setConfigSaved(false), 3000);
    } catch {
      // Ignore
    }
  };

  const filteredProducts = products.filter((p) =>
    p.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Abas Superiores */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
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

      {/* ABA: PRODUTOS */}
      {activeTab === 'produtos' && (
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[11px] leading-relaxed text-amber-800">
            <strong>Disponibilidade por cor:</strong> use os chips da coluna
            &quot;Disponibilidade por cor&quot; para alternar com um clique. As alterações
            ficam salvas neste navegador até a sincronização com o Supabase ser
            restabelecida.
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
                                className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold transition-colors ${
                                  isProntaEntrega
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                    : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'
                                }`}
                              >
                                <span
                                  className="h-2.5 w-2.5 rounded-full border border-black/10"
                                  style={{ backgroundColor: color.hex }}
                                />
                                <span className="max-w-[92px] truncate">
                                  {color.nome}
                                </span>
                                <span className="uppercase tracking-wide">
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
                      <td colSpan={6} className="text-center py-8 text-gray-400">
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
              Atualize o contato e localização sem tocar em código.
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
              className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white font-bold text-sm px-5 py-2.5 rounded-lg shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
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
              <h3 className="font-bold text-lg text-gray-900">
                {editingProduct ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}
              </h3>
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
                  placeholder="Ex: SCOOTER CAPUCCINO 1000W BEGE"
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

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-2">
                    <Palette className="mt-0.5 h-4 w-4 text-emerald-600" />
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">
                        Cores e disponibilidade
                      </h4>
                      <p className="text-[11px] leading-relaxed text-gray-500">
                        A primeira cor é a capa do card. Defina cada variação como
                        pronta entrega ou sob pedido.
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
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
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
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#25D366] hover:bg-[#20ba59] text-white rounded-lg shadow-xs transition-colors"
                >
                  Salvar Veículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
