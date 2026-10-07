import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const AdminLoginPage: React.FC = () => {
  const { admin, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (admin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [admin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/admin/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Identifiants incorrects ou compte non autorisé.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-zinc-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-violet-600 text-white flex items-center justify-center font-extrabold text-xl mx-auto shadow-lg shadow-violet-600/30">
          229
        </div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Espace Propriétaire
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400">
          Grossiste des Senteurs 229 • Administration sécurisée
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Adresse e-mail administrateur"
              type="email"
              required
              placeholder="admin@grossistedessenteurs229.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4 text-zinc-400" />}
              className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500"
            />

            <Input
              label="Mot de passe"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4 text-zinc-400" />}
              className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500"
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full font-bold shadow-md shadow-violet-600/25"
              >
                Se connecter
              </Button>
            </div>
          </form>

          <div className="pt-4 border-t border-zinc-800/80 text-center">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retour à la boutique publique</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
