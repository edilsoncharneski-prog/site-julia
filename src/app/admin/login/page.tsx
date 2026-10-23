'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, ShieldCheck, User, Zap } from 'lucide-react';
import { loginAdminAction } from '../actions';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await loginAdminAction(username, password);
    setLoading(false);

    if (res.success) {
      router.push('/admin');
      router.refresh();
    } else {
      setError(res.error || 'Usuário ou senha incorretos.');
    }
  };

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 transition-colors hover:text-gray-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Início / Voltar para o Site
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-950">
            <Zap className="h-6 w-6 fill-amber-400 text-amber-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-950">Acesso Restrito</h1>
          <p className="mt-1 text-xs text-gray-500">
            Painel Administrativo — Eletrosom Ebikes
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="admin-user"
              className="mb-1.5 block text-xs font-semibold text-gray-700"
            >
              Usuário ou E-mail
            </label>
            <div className="relative flex items-center">
              <User className="pointer-events-none absolute left-3 h-4 w-4 text-gray-400" />
              <input
                id="admin-user"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none focus:border-gray-950"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-pass"
              className="mb-1.5 block text-xs font-semibold text-gray-700"
            >
              Senha
            </label>
            <div className="relative flex items-center">
              <Lock className="pointer-events-none absolute left-3 h-4 w-4 text-gray-400" />
              <input
                id="admin-pass"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none focus:border-gray-950"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gray-950 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar no Painel'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-1.5 border-t border-gray-100 pt-4 text-[11px] text-gray-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          Ambiente protegido por autenticação segura
        </div>
      </div>
    </div>
  );
}
