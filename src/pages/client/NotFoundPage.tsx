import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="py-24 text-center max-w-md mx-auto space-y-5 px-4">
      <div className="w-16 h-16 rounded-2xl bg-violet-50 text-violet-700 flex items-center justify-center mx-auto border border-violet-100 shadow-2xs">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <h1 className="text-4xl font-black text-zinc-900">404</h1>
        <h2 className="text-lg font-bold text-zinc-800">Page introuvable</h2>
        <p className="text-xs text-zinc-500">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
      </div>

      <div className="pt-2">
        <Link to="/">
          <Button
            variant="primary"
            size="md"
            icon={<Home className="w-4 h-4" />}
          >
            Retourner à l'accueil
          </Button>
        </Link>
      </div>
    </div>
  );
};
