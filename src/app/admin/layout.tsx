import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Painel Administrativo | Julia Eletrosom',
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
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
              title="Voltar para a Loja"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 p-1 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Julia Eletrosom Logo"
                  width={30}
                  height={30}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="font-bold text-sm sm:text-base leading-tight">
                  Painel de Controle
                </h1>
                <p className="text-[11px] text-gray-500 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Julia Eletrosom CMS
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/"
              target="_blank"
              className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors"
            >
              Visualizar Loja ↗
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
