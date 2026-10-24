'use client';

import { useState } from 'react';
import { MessageCircle, X, MapPin, Phone, ArrowUpRight, Zap } from 'lucide-react';

export function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Popover / Mini Janela de Conversa */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header Verde WhatsApp */}
          <div className="bg-[#25D366] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                <Zap className="h-5 w-5 fill-gray-950 text-gray-950" />
              </div>
              <div>
                <h4 className="text-sm font-bold leading-tight">Eletrosom Ebikes</h4>
                <p className="text-[11px] text-white/90">Atendimento Oficial no WhatsApp</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-black/10 text-white transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mensagem e Opções */}
          <div className="p-4 bg-gray-50 text-gray-700 text-xs">
            <p className="mb-3 bg-white p-3 rounded-lg border border-gray-100 shadow-2xs leading-relaxed">
              👋 Olá! Seja bem-vindo à <strong>Eletrosom Ebikes</strong>. Como podemos te ajudar hoje?
            </p>

            <div className="flex flex-col gap-2">
              <a
                href="https://wa.me/5566984022988?text=Ol%C3%A1!+Gostaria+de+saber+os+modelos+de+motos+e+scooters+dispon%C3%ADveis."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-200 hover:border-[#25D366] hover:bg-emerald-50/50 transition-all text-gray-800 font-medium group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-4 h-4 fill-emerald-600 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-gray-900">Vendas & Cotação</div>
                    <div className="text-[10px] text-gray-500">(66) 98402-2988</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
              </a>

              <a
                href="https://wa.me/5566984022988?text=Ol%C3%A1!+Gostaria+de+informa%C3%A7%C3%B5es+sobre+garantia+e+suporte."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-200 hover:border-[#25D366] hover:bg-emerald-50/50 transition-all text-gray-800 font-medium group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-gray-900">Garantia & Suporte</div>
                    <div className="text-[10px] text-gray-500">Atendimento em Cotriguaçu</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </a>

              <div className="mt-2 pt-2 border-t border-gray-200 flex items-center gap-1.5 text-[11px] text-gray-500">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>Av. Tamburello, ao lado do Sicoob - Cotriguaçu/MT</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botão Flutuante Verde */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all hover:scale-108 active:scale-95 group"
        aria-label="Abrir WhatsApp"
      >
        <span className="sr-only">Conversar no WhatsApp</span>
        {isOpen ? (
          <X className="w-7 h-7 sm:w-8 sm:h-8" />
        ) : (
          <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 fill-white" />
        )}
      </button>
    </div>
  );
}
