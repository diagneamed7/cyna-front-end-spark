import React, { useState, ChangeEvent, FormEvent } from 'react';
import './ContactForm.css';
import Chatbot from './Chatbot'; // adapte le chemin si besoin


interface CountryCode {
  code: string;
  label: string;
}

const countryCodes: CountryCode[] = [
  { code: '+33', label: 'France' },
  { code: '+1', label: 'États-Unis/Canada' },
  { code: '+44', label: 'Royaume-Uni' },
  { code: '+49', label: 'Allemagne' },
  { code: '+221', label: 'Sénégal' },
  { code: '+213', label: 'Algérie' },
  { code: '+216', label: 'Tunisie' },
  { code: '+225', label: 'Côte d’Ivoire' },
  { code: '+229', label: 'Bénin' },
  { code: '+237', label: 'Cameroun' },
  // Ajoute d'autres pays si besoin
];

const ContactForm: React.FC = () => {
  const [nom, setNom] = useState<string>('');
  const [prenom, setPrenom] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [sujet, setSujet] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string>('+33');
  const [sent, setSent] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !sujet || !message || !nom || !prenom || !phone) {
      setError('Tous les champs sont requis.');
      setLoading(false);
      return;
    }

    try {
      const fullPhone = `${countryCode} ${phone}`;

      const response = await fetch('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, prenom, email, sujet, message, phone: fullPhone }),
      });

      if (!response.ok) throw new Error('Erreur lors de l’envoi.');

      setSent(true);
      setNom('');
      setPrenom('');
      setEmail('');
      setSujet('');
      setMessage('');
      setPhone('');
      setCountryCode('+33');
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-form-container">
      {sent ? (
        <div className="confirmation-message animate">
          ✅ Merci ! Votre message a été envoyé.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="contact-form text-[#8613eb]">
  <h2>Contactez-nous</h2>
  

          {error && <p className="error">{error}</p>}

          <label>
            Prénom :
            <input type="text" value={prenom} onChange={(e: ChangeEvent<HTMLInputElement>) => setPrenom(e.target.value)} required />
          </label>

          <label>
            Nom :
            <input type="text" value={nom} onChange={(e: ChangeEvent<HTMLInputElement>) => setNom(e.target.value)} required />
          </label>

          <label>
            Numéro de téléphone :
            <div className="phone-input">
              <select value={countryCode} onChange={(e: ChangeEvent<HTMLSelectElement>) => setCountryCode(e.target.value)} required>
                {countryCodes.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label} ({c.code})
                  </option>
                ))}
              </select>
              <input
                type="tel"
                value={phone}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                placeholder="Numéro sans indicatif"
                required
              />
            </div>
          </label>

          <label>
            Adresse e-mail :
            <input type="email" value={email} onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} required />
          </label>

          <label>
            Sujet :
            <input type="text" value={sujet} onChange={(e: ChangeEvent<HTMLInputElement>) => setSujet(e.target.value)} required />
          </label>

          <label>
            Message :
            <textarea value={message} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)} required />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? 'Envoi...' : 'Envoyer'}
          </button>
        </form>
      )}
      <Chatbot />

    </div>
  );
};


export default ContactForm;



