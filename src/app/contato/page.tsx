import type { Metadata } from 'next';
import { Clock, MapPin, MessageCircle, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Fale Conosco',
  description:
    'Fale com a Eletrosom Ebikes em Cotriguaçu-MT. Atendimento por WhatsApp, endereço da loja física e horário de funcionamento.',
};

export default function ContatoPage() {
  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-12 sm:px-6 sm:py-16">
      <div className="max-w-2xl">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-500">
          Atendimento
        </span>
        <h1 className="mt-3 text-3xl font-light tracking-tight text-gray-950 sm:text-5xl">
          Fale conosco
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-gray-600 sm:text-base">
          Tire dúvidas sobre modelos, cores, formas de pagamento ou manutenção. Nosso
          atendimento é feito diretamente pelo WhatsApp, com resposta rápida em horário
          comercial.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <a
          href="https://wa.me/5566984202988?text=Ol%C3%A1!+Vim+pelo+site+da+Eletrosom+Ebikes."
          target="_blank"
          rel="noopener noreferrer"
          className="group border border-gray-200 p-6 transition-colors hover:border-gray-900"
        >
          <div className="flex items-center justify-between">
            <MessageCircle className="h-6 w-6 text-[#25D366]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400 group-hover:text-gray-900">
              Resposta rápida
            </span>
          </div>
          <h2 className="mt-5 text-lg font-semibold text-gray-950">WhatsApp de vendas</h2>
          <p className="mt-1 text-sm text-gray-600">(66) 98420-2988</p>
          <p className="mt-3 text-xs leading-relaxed text-gray-500">
            Consulte disponibilidade, cores, encomendas e condições de parcelamento em
            até 21x no cartão.
          </p>
        </a>

        <div className="border border-gray-200 p-6">
          <MapPin className="h-6 w-6 text-amber-500" />
          <h2 className="mt-5 text-lg font-semibold text-gray-950">Loja física</h2>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">
            Avenida Tamburello, ao lado do Sicoob
            <br />
            Cotriguaçu - MT
          </p>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Avenida+Tamburello+Cotrigua%C3%A7u+MT"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-800 underline underline-offset-4 hover:text-amber-600"
          >
            Ver no mapa
          </a>
        </div>

        <div className="border border-gray-200 p-6">
          <Phone className="h-6 w-6 text-amber-500" />
          <h2 className="mt-5 text-lg font-semibold text-gray-950">Telefone</h2>
          <p className="mt-1 text-sm text-gray-600">(66) 98420-2988</p>
          <p className="mt-3 text-xs leading-relaxed text-gray-500">
            Prefere ligar? Atendemos também por chamada no horário comercial.
          </p>
        </div>

        <div className="border border-gray-200 p-6">
          <Clock className="h-6 w-6 text-amber-500" />
          <h2 className="mt-5 text-lg font-semibold text-gray-950">Horário de atendimento</h2>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">
            Segunda a sexta: 8h às 18h
            <br />
            Sábado: 8h às 12h
          </p>
          <p className="mt-3 text-xs leading-relaxed text-gray-500">
            Atendimento online pelo WhatsApp fora desses horários, conforme
            disponibilidade.
          </p>
        </div>
      </div>
    </div>
  );
}
