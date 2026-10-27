import Link from 'next/link';
import Image from 'next/image';
import { MapPin, MessageCircle, Phone, ShieldCheck, Zap } from 'lucide-react';

const DEV_WHATSAPP_URL =
  'https://api.whatsapp.com/send/?phone=5566984255108&text=Ol%C3%A1%2C+vi+o+site+que+voc%C3%AA+montou+para+a+Eletrosom+Ebikes%2C+gostaria+de+conversar+sobre+a+montagem+de+um+site+para+mim.&type=phone_number&app_absent=0';

export function Footer() {
  return (
    <footer className="w-full border-t border-gray-800 bg-[#1b1e22] pb-8 pt-12 text-gray-300">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 border-b border-gray-800 pb-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Coluna 1: Sobre & Marca */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-gray-950">
                <Image
                  src="/logo-eletrosom.webp"
                  alt="Logo Eletrosom Ebikes"
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </span>
              <div>
                <h3 className="text-lg font-black leading-tight tracking-tight text-white">
                  Eletrosom Ebikes
                </h3>
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-amber-400">
                  Mobilidade Elétrica
                </p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-gray-400">
              Referência em mobilidade elétrica em Cotriguaçu e região. Scooters, motos
              autopropelidas, triciclos e bikes elétricas sem necessidade de CNH nem
              emplacamento.
            </p>
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>Garantia de fábrica & Suporte Oficial</span>
            </div>
          </div>

          {/* Coluna 2: Categorias */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Categorias
            </h4>
            <ul className="flex flex-col gap-2 text-xs text-gray-400">
              <li>
                <Link
                  href="/produtos?categoria=autopropelidos"
                  className="transition-colors hover:text-white"
                >
                  Autopropelidos (Sem CNH)
                </Link>
              </li>
              <li>
                <Link
                  href="/produtos?categoria=bikes-eletricas"
                  className="transition-colors hover:text-white"
                >
                  Bikes Elétricas
                </Link>
              </li>
              <li>
                <Link
                  href="/produtos?categoria=triciclos"
                  className="transition-colors hover:text-white"
                >
                  Triciclos Elétricos
                </Link>
              </li>
              <li>
                <Link
                  href="/produtos?categoria=patinetes"
                  className="transition-colors hover:text-white"
                >
                  Patinetes Elétricos
                </Link>
              </li>
              <li>
                <Link
                  href="/produtos?categoria=acessorios"
                  className="transition-colors hover:text-white"
                >
                  Acessórios & Peças
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Institucional & Regulatório */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Informações & Dúvidas
            </h4>
            <ul className="flex flex-col gap-2 text-xs text-gray-400">
              <li>
                <span className="flex items-center gap-1 font-medium text-gray-300">
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  Resolução CONTRAN 996/23
                </span>
                <span className="mt-0.5 block text-[11px] text-gray-500">
                  Não exige CNH, IPVA ou emplacamento.
                </span>
              </li>
              <li className="pt-2">
                <Link href="/sobre" className="transition-colors hover:text-white">
                  Quem Somos
                </Link>
              </li>
              <li>
                <Link href="/contato" className="transition-colors hover:text-white">
                  Fale Conosco
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Loja Física & Contato */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Loja Física
            </h4>
            <div className="flex flex-col gap-3 text-xs text-gray-400">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <span>Avenida Tamburello, ao lado do Sicoob - Cotriguaçu/MT</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>(66) 98402-2988</span>
              </div>
              <div className="mt-2">
                <a
                  href="https://wa.me/5566984022988"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#20ba59]"
                >
                  <MessageCircle className="h-4 w-4 fill-white" />
                  Atendimento via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 pt-6 text-xs text-gray-500 sm:flex-row">
          <p>© 2026 Eletrosom Ebikes. Todos os direitos reservados.</p>

          <a
            href={DEV_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Desenvolvido por Edilson Charneski — Falar no WhatsApp"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#12161c] px-2.5 py-1.5 text-[11px] font-medium text-gray-300 transition-colors hover:border-white/25 hover:text-white"
          >
            <Image
              src="/qr-dev.png"
              alt="QR Code WhatsApp Edilson Charneski"
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded bg-white p-0.5"
            />
            <span>Desenvolvido por Edilson Charneski</span>
          </a>

          <p className="text-[11px]">Cotriguaçu - Mato Grosso</p>
        </div>
      </div>
    </footer>
  );
}
