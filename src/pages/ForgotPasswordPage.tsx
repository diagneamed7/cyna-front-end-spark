import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi2';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitted(false);
    if (!email.trim()) {
      setError("L'email est requis");
      return;
    }
    // Ici, tu pourras appeler l'API /auth/forgot-password plus tard
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fbfa] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-8 border border-[#e8f2ec]">
        <Link to="/connexion" className="flex items-center gap-2 mb-6 text-[#51946b] hover:underline">
          <HiArrowLeft className="w-5 h-5" /> Retour à la connexion
        </Link>
        <h2 className="text-2xl font-bold mb-2 text-[#0e1a13]">Mot de passe oublié</h2>
        <p className="mb-6 text-[#6a7581]">Saisis ton adresse email pour recevoir un lien de réinitialisation.</p>
        {submitted ? (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 text-center">
            Si un compte existe, un email de réinitialisation a été envoyé.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              className="w-full px-4 py-3 rounded-lg border border-[#e8f2ec] focus:outline-none focus:ring-2 focus:ring-[#eb9f13]/20"
              placeholder="votre.email@exemple.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button
              type="submit"
              className="w-full px-4 py-3 rounded-lg bg-[#eb9f13] text-white font-semibold hover:bg-[#d48f0f] mt-2"
            >
              Envoyer le lien de réinitialisation
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 