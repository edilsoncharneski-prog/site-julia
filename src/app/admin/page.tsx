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
  Eye,
  EyeOff,
  Zap,
  Save,
  Search,
} from 'lucide-react';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { Product } from '@/components/ProductCard';
import initialProductsData from '@/data/produtos-loja.json';

const INITIAL_MOCK_PRODUCTS: Product[] = initialProductsData as Product[];

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
  const [formImagemUrl, setFormImagemUrl] = useState('');

  // Configurações da Loja
  const [whatsapp, setWhatsapp] = useState('5566984202988');
  const [endereco, setEndereco] = useState('Avenida Tamburello, ao lado do Sicoob - Cotriguaçu/MT');
  const [configSaved, setConfigSaved] = useState(false);

  // Carregar produtos salvos
  useEffect(() => {
    try {
      const saved = localStorage.getItem('julia_admin_products');
      if (saved) {
        setProducts(JSON.parse(saved));
      } else {
        setProducts(INITIAL_MOCK_PRODUCTS);
        localStorage.setItem('julia_admin_products', JSON.stringify(INITIAL_MOCK_PRODUCTS));
      }

      const savedWp = localStorage.getItem('julia_admin_wp');
      if (savedWp) setWhatsapp(savedWp);

      const savedEnd = localStorage.getItem('julia_admin_end');
      if (savedEnd) setEndereco(savedEnd);
    } catch {
      setProducts(INITIAL_MOCK_PRODUCTS);
    }
  }, []);

  const saveProductsToStorage = (updated: Product[]) => {
    setProducts(updated);
    try {
      localStorage.setItem('julia_admin_products', JSON.stringify(updated));
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
    setFormImagemUrl('');
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
    setFormImagemUrl(p.imagem_capa || '');
    setIsModalOpen(true);
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

    const newProd: Product = {
      id: editingProduct ? editingProduct.id : Date.now().toString(),
      titulo: formTitulo.trim(),
      slug,
      descricao: formDescricao.trim(),
      preco: formPreco ? parseFloat(formPreco) : null,
      exibir_preco: formExibirPreco,
      destaque: formDestaque,
      dispensa_cnh: formDispensaCnh,
      potencia_motor: formMotor.trim(),
      tipo_bateria: formBateria.trim(),
      autonomia: formAutonomia.trim(),
      velocidade_maxima: formVelocidade.trim(),
      imagem_capa: formImagemUrl.trim() || undefined,
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
      localStorage.setItem('julia_admin_wp', whatsapp);
      localStorage.setItem('julia_admin_end', endereco);
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
                    <th className="py-3 px-4 text-center">Destaque</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-gray-900 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden relative">
                          {p.imagem_capa ? (
                            <Image
                              src={p.imagem_capa}
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
                            {p.titulo}
                          </div>
                          <span className="text-[11px] text-gray-400">slug: {p.slug}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs">
                        <div className="text-gray-800 font-medium">{p.potencia_motor} • {p.tipo_bateria}</div>
                        <div className="text-gray-500 text-[11px]">Autonomia: {p.autonomia}</div>
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
                      <td colSpan={5} className="text-center py-8 text-gray-400">
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

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  URL da Imagem de Capa
                </label>
                <input
                  type="text"
                  value={formImagemUrl}
                  onChange={(e) => setFormImagemUrl(e.target.value)}
                  placeholder="https://... ou caminho da imagem"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-hidden focus:border-gray-500"
                />
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
