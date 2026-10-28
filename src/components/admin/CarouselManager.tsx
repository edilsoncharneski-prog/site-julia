'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Upload,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Image as ImageIcon,
  ExternalLink,
  ArrowUpDown,
  Plus,
} from 'lucide-react';
import {
  type CarouselSlide,
  listCarouselSlidesAdminAction,
  createCarouselSlideAction,
  toggleCarouselSlideActiveAction,
  updateCarouselSlideOrderAction,
  deleteCarouselSlideAction,
} from '@/app/admin/actions';

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB

interface CarouselManagerProps {
  initialSlides?: CarouselSlide[];
  onNotify?: (text: string, isError?: boolean) => void;
}

export function CarouselManager({
  initialSlides = [],
  onNotify,
}: CarouselManagerProps) {
  const [slides, setSlides] = useState<CarouselSlide[]>(initialSlides);
  const [isLoadingList, setIsLoadingList] = useState(initialSlides.length === 0);

  // Campos do formulário de cadastro
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const notify = (text: string, isError = false) => {
    if (onNotify) {
      onNotify(text, isError);
    }
  };

  const fetchSlides = async () => {
    setIsLoadingList(true);
    const res = await listCarouselSlidesAdminAction();
    setIsLoadingList(false);
    if (res.success) {
      setSlides(res.slides);
    } else if (res.error) {
      notify(res.error, true);
    }
  };

  useEffect(() => {
    fetchSlides();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0] || null;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const isWebpExt = file.name.toLowerCase().endsWith('.webp');
    const isWebpMime = file.type === 'image/webp';

    if (!isWebpExt || !isWebpMime) {
      setSelectedFile(null);
      e.target.value = '';
      const msg =
        'Formato não permitido! Selecione exclusivamente uma imagem com extensão .webp (arquivos .jpg, .png ou outros são bloqueados).';
      setFileError(msg);
      notify(msg, true);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      e.target.value = '';
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
      const msg = `O arquivo selecionado possui ${sizeInMb} MB e excede o limite máximo permitido de 1 MB.`;
      setFileError(msg);
      notify(msg, true);
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const resetForm = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileError(null);
    setTitle('');
    setSubtitle('');
    setLinkUrl('');
    setDisplayOrder(0);
    setIsActive(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      const msg = 'Selecione uma imagem .webp de até 1 MB antes de salvar o slide.';
      setFileError(msg);
      notify(msg, true);
      return;
    }

    setIsSubmitting(true);
    setFileError(null);

    try {
      // 1. Upload da imagem para /api/admin/carousel/upload
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadResponse = await fetch('/api/admin/carousel/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok || !uploadData.url) {
        const errMsg = uploadData.error || 'Falha ao enviar a imagem do slide.';
        setFileError(errMsg);
        notify(errMsg, true);
        setIsSubmitting(false);
        return;
      }

      // 2. Gravação do slide na tabela carousel_slides
      const createRes = await createCarouselSlideAction({
        title: title.trim() || null,
        subtitle: subtitle.trim() || null,
        image_url: uploadData.url,
        link_url: linkUrl.trim() || null,
        display_order: Number(displayOrder) || 0,
        is_active: isActive,
      });

      if (!createRes.success || !createRes.slide) {
        const errMsg = createRes.error || 'Erro ao registrar o slide.';
        notify(errMsg, true);
        setIsSubmitting(false);
        return;
      }

      notify('Slide adicionado ao carrossel com sucesso!');
      resetForm();
      await fetchSlides();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro inesperado ao salvar slide.';
      notify(msg, true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (slide: CarouselSlide) => {
    const nextStatus = !slide.is_active;

    setSlides((prev) =>
      prev.map((item) =>
        item.id === slide.id ? { ...item, is_active: nextStatus } : item
      )
    );

    const res = await toggleCarouselSlideActiveAction(slide.id, nextStatus);
    if (res.success) {
      notify(
        nextStatus
          ? 'Slide ativado no carrossel!'
          : 'Slide ocultado do carrossel!'
      );
    } else {
      setSlides((prev) =>
        prev.map((item) =>
          item.id === slide.id ? { ...item, is_active: slide.is_active } : item
        )
      );
      notify(res.error || 'Não foi possível alterar o status do slide.', true);
    }
  };

  const handleOrderChange = async (slide: CarouselSlide, newOrder: number) => {
    setSlides((prev) =>
      prev
        .map((item) =>
          item.id === slide.id ? { ...item, display_order: newOrder } : item
        )
        .sort((a, b) => a.display_order - b.display_order)
    );

    const res = await updateCarouselSlideOrderAction(slide.id, newOrder);
    if (res.success) {
      notify('Ordem de apresentação atualizada!');
    } else {
      notify(res.error || 'Erro ao atualizar a ordem do slide.', true);
      fetchSlides();
    }
  };

  const handleDelete = async (slide: CarouselSlide) => {
    if (
      !window.confirm(
        `Deseja realmente excluir o slide "${slide.title || 'Sem título'}"?`
      )
    ) {
      return;
    }

    const previous = slides;
    setSlides((prev) => prev.filter((item) => item.id !== slide.id));

    const res = await deleteCarouselSlideAction(slide.id, slide.image_url);
    if (res.success) {
      notify('Slide removido com sucesso!');
    } else {
      setSlides(previous);
      notify(res.error || 'Erro ao excluir slide.', true);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Formulário de Cadastro de Novo Slide */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-2xs"
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Adicionar Novo Slide ao Carrossel
            </h3>
            <p className="text-xs text-gray-500">
              Envie banners promocionais otimizados (somente formato{' '}
              <strong className="text-gray-800">.webp</strong> até{' '}
              <strong className="text-gray-800">1 MB</strong>).
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-800 border border-amber-200">
            Formato Obrigatório: .WEBP (Máx. 1 MB)
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Coluna Upload + Preview */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <label className="block text-xs font-semibold text-gray-700">
              Imagem do Banner (.webp) *
            </label>

            <label
              htmlFor="carousel-file-input"
              className={`group relative flex aspect-16/7 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors ${
                fileError
                  ? 'border-red-300 bg-red-50/40'
                  : previewUrl
                    ? 'border-emerald-300 bg-gray-950'
                    : 'border-gray-300 bg-gray-50 hover:border-gray-900 hover:bg-gray-100/70'
              }`}
            >
              {previewUrl ? (
                <>
                  <Image
                    src={previewUrl}
                    alt="Pré-visualização do banner"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-gray-900 shadow">
                      Trocar imagem .webp
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center">
                  <Upload className="mb-2 h-7 w-7 text-gray-400 group-hover:text-gray-800" />
                  <span className="text-xs font-semibold text-gray-700">
                    Clique para selecionar uma imagem .webp
                  </span>
                  <span className="mt-1 text-[11px] text-gray-400">
                    Recomendado: 1600×600px ou 1920×700px • Máximo 1 MB
                  </span>
                </div>
              )}

              <input
                ref={fileInputRef}
                id="carousel-file-input"
                type="file"
                accept=".webp,image/webp"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>

            {selectedFile && !fileError && (
              <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
                <span className="truncate font-medium">{selectedFile.name}</span>
                <span className="ml-2 shrink-0 font-bold">
                  {(selectedFile.size / 1024).toFixed(0)} KB
                </span>
              </div>
            )}

            {fileError && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <span>{fileError}</span>
              </div>
            )}
          </div>

          {/* Coluna Campos de Configuração */}
          <div className="lg:col-span-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-gray-700">
                Título Principal (Opcional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Scooters Elétricas em até 12x no Cartão"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-600 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-gray-700">
                Subtítulo / Chamada Secundária (Opcional)
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Ex: Pronta entrega em Cotriguaçu/MT • Sem CNH e sem emplacamento"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">
                Link de Destino ao Clicar (Opcional)
              </label>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="Ex: /produtos?categoria=autopropelidos"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">
                Ordem de Exibição
              </label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-600 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-4 pt-2">
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-gray-800">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 accent-emerald-600"
                />
                <span>Publicar slide imediatamente (Ativo)</span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-bold text-white shadow-xs transition-colors hover:bg-black disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando e salvando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Adicionar Slide
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Listagem de Slides Cadastrados */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-2xs">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Slides do Carrossel ({slides.length})
            </h3>
            <p className="text-xs text-gray-500">
              Gerencie a ordem, visibilidade ou exclua slides existentes.
            </p>
          </div>
        </div>

        {isLoadingList ? (
          <div className="flex items-center justify-center py-12 text-sm text-gray-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-gray-400" />
            Carregando slides...
          </div>
        ) : slides.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 p-10 text-center text-gray-500">
            <ImageIcon className="mb-2 h-10 w-10 text-gray-300" />
            <p className="text-sm font-semibold text-gray-700">
              Nenhum slide personalizado cadastrado no momento
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Utilize o formulário acima para enviar o primeiro banner em formato .webp.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {slides.map((slide) => (
              <div
                key={slide.id}
                className={`flex flex-col justify-between overflow-hidden rounded-xl border transition-all ${
                  slide.is_active
                    ? 'border-gray-200 bg-white'
                    : 'border-gray-200 bg-gray-50 opacity-75'
                }`}
              >
                <div className="relative aspect-16/7 w-full bg-gray-950">
                  <Image
                    src={slide.image_url}
                    alt={slide.title || 'Slide do carrossel'}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute left-3 top-3 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-xs ${
                        slide.is_active
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-700 text-gray-200'
                      }`}
                    >
                      {slide.is_active ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" /> Ativo
                        </>
                      ) : (
                        'Inativo'
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between gap-4 p-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      {slide.title || (
                        <span className="italic text-gray-400">Sem título sobreposto</span>
                      )}
                    </h4>
                    {slide.subtitle && (
                      <p className="mt-0.5 text-xs text-gray-500">{slide.subtitle}</p>
                    )}
                    {slide.link_url && (
                      <a
                        href={slide.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 hover:underline"
                      >
                        <span>Link: {slide.link_url}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
                      <label className="text-[11px] font-semibold text-gray-600">
                        Ordem:
                      </label>
                      <input
                        type="number"
                        value={slide.display_order}
                        onChange={(e) =>
                          handleOrderChange(slide, Number(e.target.value))
                        }
                        className="w-16 rounded border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-900"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(slide)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                          slide.is_active
                            ? 'border border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {slide.is_active ? 'Desativar' : 'Ativar'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(slide)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
                        title="Excluir slide"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
