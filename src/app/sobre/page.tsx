import type { Metadata } from 'next';
import Link from 'next/link';
import { BatteryCharging, MapPin, ShieldCheck, Wrench, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Quem Somos',
  description:
    'Conheça a Eletrosom Ebikes, loja de veículos elétricos em Cotriguaçu-MT. Scooters, bikes, triciclos, peças e suporte de fábrica.',
};

export default function SobrePage() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-12 sm:px-6 sm:py-16">
      <div className="max-w-3xl">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-500">
          Eletrosom Ebikes
        </span>
        <h1 className="mt-3 text-3xl font-light leading-tight tracking-tight text-gray-950 sm:text-5xl">
          Mobilidade elétrica com atendimento de verdade.
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-gray-600 sm:text-base">
          A Eletrosom Ebikes nasceu para aproximar as pessoas da mobilidade elétrica em
          Cotriguaçu e região. Trabalhamos com scooters, motos autopropelidas, bikes e
          triciclos elétricos que dispensam CNH e emplacamento, com orientação honesta
          antes e depois da compra.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-gray-600 sm:text-base">
          Mais do que vender veículos, queremos que você tenha tranquilidade para usar o
          seu todos os dias. Por isso trabalhamos com garantia de fábrica, peças de reposição e
          uma equipe pronta para tirar qualquer dúvida antes e após sua compra.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        <div className="border border-gray-200 p-6">
          <Zap className="h-5 w-5 text-amber-500" />
          <h2 className="mt-4 text-sm font-semibold text-gray-950">Veículos selecionados</h2>
          <p className="mt-2 text-xs leading-relaxed text-gray-500">
            Modelos escolhidos pela relação entre autonomia, conforto e custo-benefício
            para a rotina da nossa região.
          </p>
        </div>
        <div className="border border-gray-200 p-6">
          <Wrench className="h-5 w-5 text-amber-500" />
          <h2 className="mt-4 text-sm font-semibold text-gray-950">Garantia e peças</h2>
          <p className="mt-2 text-xs leading-relaxed text-gray-500">
            Garantia oficial de fábrica e disponibilidade de peças de reposição para o seu veículo.
          </p>
        </div>
        <div className="border border-gray-200 p-6">
          <ShieldCheck className="h-5 w-5 text-amber-500" />
          <h2 className="mt-4 text-sm font-semibold text-gray-950">Garantia e suporte</h2>
          <p className="mt-2 text-xs leading-relaxed text-gray-500">
            Garantia de fábrica e acompanhamento próximo para tirar dúvidas sobre uso,
            recarga e manutenção.
          </p>
        </div>
      </div>

      <div className="mt-12 grid gap-6 border-t border-gray-200 pt-8 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="flex flex-col gap-2 text-sm text-gray-600">
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-amber-500" />
            Avenida Tamburello, ao lado do Sicoob - Cotriguaçu/MT
          </span>
          <span className="flex items-center gap-2">
            <BatteryCharging className="h-4 w-4 text-amber-500" />
            Atendimento de segunda a sábado
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/produtos"
            className="border border-gray-300 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-800 transition-colors hover:border-gray-900 hover:bg-gray-900 hover:text-white"
          >
            Ver catálogo
          </Link>
          <a
            href="https://wa.me/5566984202988?text=Ol%C3%A1!+Gostaria+de+conhecer+a+Eletrosom+Ebikes."
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#20ba59]"
          >
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
