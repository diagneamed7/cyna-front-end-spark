import { useState, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';

interface Message {
  from: 'user' | 'bot';
  text: string;
}

const faq: Record<string, string> = {
  "Comment modifier mon abonnement ?": "Vous pouvez modifier votre abonnement dans votre espace personnel.",
  "Quelles sont les méthodes de paiement acceptées ?": "Nous acceptons les cartes bancaires, PayPal et virements.",
  "Quels sont les délais de livraison ?": "Les délais de livraison varient entre 2 à 5 jours ouvrés selon votre localisation.",
  "Comment suivre ma commande ?": "Vous pouvez suivre votre commande depuis votre espace client dans la rubrique 'Mes commandes'.",
  "Puis-je retourner un produit ?": "Oui, vous avez 14 jours pour retourner un produit non utilisé.",
  "Comment utiliser un code promo ?": "Vous pouvez entrer votre code promo au moment du paiement, dans le champ dédié.",
  "Mon paiement a échoué, que faire ?": "Veuillez vérifier vos informations bancaires ou essayer un autre moyen de paiement.",
  "Puis-je modifier mon adresse de livraison ?": "Oui, tant que la commande n’a pas été expédiée, vous pouvez modifier votre adresse depuis votre compte.",
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<string>('');
  const [showAgentButton, setShowAgentButton] = useState<boolean>(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setShowAgentButton(false);
  };

  const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const question = e.target.value;
    const response = faq[question];

    if (question === 'autre') {
      setShowAgentButton(true);
      setMessages((prev) => [
        ...prev,
        { from: 'user', text: "Autre question" },
        { from: 'bot', text: "Je n’ai pas compris. Souhaitez-vous contacter un agent ?" }
      ]);
    } else if (question && response) {
      setShowAgentButton(false);
      setMessages((prev) => [
        ...prev,
        { from: 'user', text: question },
        { from: 'bot', text: response }
      ]);
    }

    setSelectedQuestion('');
  };

  const handleContactAgent = () => {
    setMessages((prev) => [
      ...prev,
      { from: 'user', text: "Je souhaite parler à un agent." },
      { from: 'bot', text: "Un agent va vous répondre dans les plus brefs délais. Merci de patienter." }
    ]);
    setShowAgentButton(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
  onClick={toggleChat}
  className=" text-[#7a03f9] text-lg font-bold px-6 py-3 rounded-full shadow-xl transition-all duration-200"
>
  💬 En quoi puis-je vous aider?
</button>

      {isOpen && (
        <div className="w-80 mt-4 bg-white border border-blue-200 rounded-xl shadow-lg overflow-hidden animate-fade-in">
          <div className="p-4 h-64 overflow-y-auto space-y-2 flex flex-col transition-all duration-300 ease-out">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-md text-sm max-w-[90%] ${
                  msg.from === 'user'
                    ? 'bg-blue-100 text-blue-800 font-semibold self-end text-right ml-auto'
                    : 'bg-gray-100 text-[#eb9f13] italic text-left'
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-blue-100 bg-blue-50">
            <select
              value={selectedQuestion}
              onChange={handleSelect}
              className="w-full p-2 border border-blue-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-[#eb9f13]"
            >
              <option value="">-- Choisissez une question --</option>
              {Object.keys(faq).map((question, i) => (
                <option key={i} value={question}>
                  {question}
                </option>
              ))}
              <option value="autre">Autre question</option>
            </select>

            {showAgentButton && (
              <Link
                to="/contact"
                className="mt-3 block text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-md transition"
              >
                <span className="text-[#eb9f13] font-semibold">📞 Contacter un agent</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
