import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, MessageCircle, ShieldCheck, Zap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-[#1b1e22] text-gray-300 pt-12 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        {/* Grid de 4 Colunas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-gray-800">
          {/* Coluna 1: Sobre & Logo */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white p-1 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Julia Eletrosom Logo"
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg leading-tight">Julia Eletrosom</h3>
                <p className="text-xs text-amber-400 font-medium">Energia Solar & Veículos Elétricos</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Referência em mobilidade elétrica em Cotriguaçu e região. Scooters, motos autopropelidas, triciclos e bikes elétricas sem necessidade de CNH nem emplacamento.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Garantia de fábrica & Oficina própria</span>
            </div>
          </div>

          {/* Coluna 2: Categorias */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Categorias
            </h4>
            <ul className="flex flex-col gap-2 text-xs text-gray-400">
              <li>
                <Link href="/categoria/autopropelidos" className="hover:text-white transition-colors">
                  Autopropelidos (Sem CNH)
                </Link>
              </li>
              <li>
                <Link href="/categoria/bikes-eletricas" className="hover:text-white transition-colors">
                  Bikes Elétricas
                </Link>
              </li>
              <li>
                <Link href="/categoria/triciclos" className="hover:text-white transition-colors">
                  Triciclos Elétricos
                </Link>
              </li>
              <li>
                <Link href="/categoria/patinetes" className="hover:text-white transition-colors">
                  Patinetes Elétricos
                </Link>
              </li>
              <li>
                <Link href="/categoria/acessorios" className="hover:text-white transition-colors">
                  Acessórios & Peças
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Institucional & Regulatório */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Informações & Dúvidas
            </h4>
            <ul className="flex flex-col gap-2 text-xs text-gray-400">
              <li>
                <span className="text-gray-300 font-medium flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Resolução CONTRAN 996/23
                </span>
                <span className="block text-[11px] text-gray-500 mt-0.5">
                  Não exige CNH, IPVA ou emplacamento.
                </span>
              </li>
              <li className="pt-2">
                <Link href="/sobre" className="hover:text-white transition-colors">
                  Quem Somos
                </Link>
              </li>
              <li>
                <Link href="/contato" className="hover:text-white transition-colors">
                  Fale Conosco
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Loja Física & Contato */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Loja Física
            </h4>
            <div className="flex flex-col gap-3 text-xs text-gray-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Avenida Tamburello, ao lado do Sicoob - Cotriguaçu/MT</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>(66) 98420-2988</span>
              </div>
              <div className="mt-2">
                <a
                  href="https://wa.me/5566984202988"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  Atendimento via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright & Assinatura */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© 2026 Julia Eletrosom. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1 text-[11px]">
            Cotriguaçu - Mato Grosso
          </p>
        </div>
      </div>
    </footer>
  );
}
