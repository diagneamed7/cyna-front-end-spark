import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi2';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitted(false);
    if (!password || !confirm) {
      setError('Tous les champs sont requis');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (!token) {
      setError('Lien de réinitialisation invalide.');
      return;
    }
    setLoading(true);
    try {
      // Appel API réel à brancher ici
      const response = await fetch('/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess('Mot de passe réinitialisé avec succès. Vous pouvez vous connecter.');
        setSubmitted(true);
      } else {
        setError(data.error || 'Erreur lors de la réinitialisation.');
      }
    } catch (err) {
      setError('Erreur réseau ou serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fbfa] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-8 border border-[#e8f2ec]">
        <Link to="/connexion" className="flex items-center gap-2 mb-6 text-[#51946b] hover:underline">
          <HiArrowLeft className="w-5 h-5" /> Retour à la connexion
        </Link>
        <h2 className="text-2xl font-bold mb-2 text-[#0e1a13]">Nouveau mot de passe</h2>
        <p className="mb-6 text-[#6a7581]">Saisis ton nouveau mot de passe pour finaliser la réinitialisation.</p>
        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 text-center mb-4">
            {success}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              className="w-full px-4 py-3 rounded-lg border border-[#e8f2ec] focus:outline-none focus:ring-2 focus:ring-[#eb9f13]/20"
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              className="w-full px-4 py-3 rounded-lg border border-[#e8f2ec] focus:outline-none focus:ring-2 focus:ring-[#eb9f13]/20"
              placeholder="Confirmer le mot de passe"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button
              type="submit"
              className="w-full px-4 py-3 rounded-lg bg-[#eb9f13] text-white font-semibold hover:bg-[#d48f0f] mt-2"
              disabled={loading}
            >
              {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage; 