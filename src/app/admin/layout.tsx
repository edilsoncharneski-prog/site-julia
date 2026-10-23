import Link from 'next/link';
import { ArrowLeft, Home, ShieldCheck, Zap } from 'lucide-react';

export const metadata = {
  title: 'Painel Administrativo | Eletrosom Ebikes',
  description: 'Gerenciamento de produtos, banners e configurações da loja.',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-gray-900">
      {/* Topo do Painel */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-950 transition-colors"
              title="Voltar para a Vitrine Principal"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Início</span>
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-950">
                <Zap className="h-4 w-4 fill-amber-400 text-amber-400" />
              </div>
              <div>
                <h1 className="font-bold text-sm sm:text-base leading-tight">
                  Painel Administrativo
                </h1>
                <p className="text-[11px] text-gray-500 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Eletrosom Ebikes
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Voltar para o Site</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal do Painel */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
