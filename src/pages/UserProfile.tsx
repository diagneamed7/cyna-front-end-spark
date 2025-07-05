import React, { useEffect, useState } from 'react';
import { authService } from '../services/api/auth';
import { addressService, type UserAddress } from '../services';
import { HiOutlineUser, HiOutlineHome, HiOutlineCreditCard, HiOutlineBadgeCheck, HiOutlineClipboardList, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiArrowLeft } from 'react-icons/hi';

const customStyles = {
  bgPrimary: 'bg-[#f8fbfa]',
  textPrimary: 'text-[#0e1a13]',
  textSecondary: 'text-[#51946b]',
  bgSecondary: 'bg-[#e8f2ec]',
  bgAccent: 'bg-[#eb9f13]',
  borderColor: 'border-[#e8f2ec]',
  hoverAccent: 'hover:text-[#eb9f13]',
  textAccent: 'text-[#eb9f13]'
};

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  // Données fictives pour les autres sections
  const payments = [
    { id: 1, type: 'Visa', last4: '1234', expiry: '12/25' },
    { id: 2, type: 'Mastercard', last4: '5678', expiry: '08/24' },
  ];
  const subscriptions = [
    { id: 1, name: 'SaaS Pro', status: 'Actif', renewal: '2024-12-01' },
    { id: 2, name: 'SaaS Basic', status: 'Expiré', renewal: '2023-10-01' },
  ];
  const orders = [
    { id: 1, year: 2024, ref: 'CMD2024-001', date: '2024-01-15', total: '49,99€', invoice: '#' },
    { id: 2, year: 2024, ref: 'CMD2024-002', date: '2024-03-10', total: '19,99€', invoice: '#' },
    { id: 3, year: 2023, ref: 'CMD2023-001', date: '2023-07-22', total: '99,99€', invoice: '#' },
  ];
  const addresses = [
    { id: 1, label: 'Domicile', address: '12 rue des Lilas, 75000 Paris' },
    { id: 2, label: 'Travail', address: '5 avenue de la République, 75011 Paris' },
  ];

  useEffect(() => {
    authService.getProfile()
      .then((data: any) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err: any) => {
        setError('Impossible de charger le profil.');
        setLoading(false);
      });
  }, []);

  // Regrouper les commandes par année
  const ordersByYear = orders.reduce((acc: any, order) => {
    acc[order.year] = acc[order.year] || [];
    acc[order.year].push(order);
    return acc;
  }, {});

  // Avatar à partir des initiales
  const initials = `${user?.prenom?.charAt(0) || ''}${user?.nom?.charAt(0) || ''}`.toUpperCase();

  // Gestion du formulaire d'édition
  const handleEditClick = () => {
    setEditData({
      nom: user.nom || '',
      prenom: user.prenom || '',
      email: user.email || '',
      telephone: user.telephone || ''
    });
    setEditMode(true);
    setEditSuccess(null);
    setEditError(null);
  };
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };
  const handleEditCancel = () => {
    setEditMode(false);
    setEditError(null);
    setEditSuccess(null);
  };
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    setEditSuccess(null);
    try {
      await authService.updateProfile(editData);
      setEditSuccess('Profil mis à jour avec succès.');
      // Recharge les infos utilisateur
      const updated = await authService.getProfile();
      setUser(updated);
      setEditMode(false);
    } catch (err: any) {
      setEditError(err?.message || 'Erreur lors de la mise à jour.');
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) return <div className="p-8">Chargement...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!user) return <div className="p-8">Aucune donnée utilisateur.</div>;

  return (
    <div className={`${customStyles.bgPrimary} min-h-screen p-0 sm:p-8`}>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Bouton retour */}
        <button
          onClick={() => window.history.back()}
          className={`flex items-center gap-2 mb-4 px-4 py-2 rounded-lg ${customStyles.bgAccent} text-white font-semibold hover:bg-[#d48f0f] shadow`}
        >
          <HiArrowLeft className="w-5 h-5" /> Retour
        </button>

        {/* Carte profil */}
        <section className={`bg-white rounded-2xl shadow flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8 border ${customStyles.borderColor}`}>
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#e8f2ec] to-[#eb9f13]/20 flex items-center justify-center text-4xl font-bold text-[#51946b] shadow-inner border-4 border-[#eb9f13]/10">
              {user.photo_url ? (
                <img src={user.photo_url} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                initials || <HiOutlineUser className="w-12 h-12 text-[#eb9f13]" />
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            {editMode ? (
              <form onSubmit={handleEditSave} className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    name="prenom"
                    value={editData.prenom}
                    onChange={handleEditChange}
                    placeholder="Prénom"
                    className={`flex-1 px-4 py-2 rounded-lg border ${customStyles.borderColor} ${customStyles.textPrimary} focus:outline-none focus:ring-2 focus:ring-[#eb9f13]/20`}
                    required
                  />
                  <input
                    type="text"
                    name="nom"
                    value={editData.nom}
                    onChange={handleEditChange}
                    placeholder="Nom"
                    className={`flex-1 px-4 py-2 rounded-lg border ${customStyles.borderColor} ${customStyles.textPrimary} focus:outline-none focus:ring-2 focus:ring-[#eb9f13]/20`}
                    required
                  />
                </div>
                <input
                  type="email"
                  name="email"
                  value={editData.email}
                  onChange={handleEditChange}
                  placeholder="Email"
                  className={`w-full px-4 py-2 rounded-lg border ${customStyles.borderColor} ${customStyles.textPrimary} focus:outline-none focus:ring-2 focus:ring-[#eb9f13]/20`}
                  required
                />
                <input
                  type="text"
                  name="telephone"
                  value={editData.telephone}
                  onChange={handleEditChange}
                  placeholder="Téléphone"
                  className={`w-full px-4 py-2 rounded-lg border ${customStyles.borderColor} ${customStyles.textPrimary} focus:outline-none focus:ring-2 focus:ring-[#eb9f13]/20`}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    disabled={editLoading}
                    className={`px-4 py-2 rounded-lg ${customStyles.bgAccent} text-white font-semibold hover:bg-[#d48f0f] flex items-center gap-2 shadow disabled:opacity-60`}
                  >
                    {editLoading ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                  <button
                    type="button"
                    onClick={handleEditCancel}
                    className={`px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 flex items-center gap-2 shadow`}
                  >
                    Annuler
                  </button>
                </div>
                {editError && <div className="text-red-500 text-sm mt-1">{editError}</div>}
                {editSuccess && <div className="text-green-600 text-sm mt-1">{editSuccess}</div>}
              </form>
            ) : (
              <>
                <h1 className={`text-2xl sm:text-3xl font-bold mb-1 ${customStyles.textPrimary}`}>{user.prenom} {user.nom}</h1>
                <p className={`mb-2 ${customStyles.textSecondary}`}>{user.email}</p>
                <p className="mb-2 text-gray-500">{user.telephone || 'Téléphone non renseigné'}</p>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <HiOutlineBadgeCheck className="w-5 h-5 text-green-500" />
                  <span>Utilisateur vérifié</span>
                </div>
                <button
                  className={`mt-4 px-4 py-2 rounded-lg ${customStyles.bgAccent} text-white font-semibold hover:bg-[#d48f0f] flex items-center gap-2 shadow`}
                  onClick={handleEditClick}
                >
                  <HiOutlinePencil className="w-5 h-5" /> Modifier
                </button>
              </>
            )}
          </div>
        </section>

        {/* Sections en grid responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Adresses (lecture seule, mock) */}
          <section className={`bg-white rounded-2xl shadow p-6 border ${customStyles.borderColor}`}>
            <div className="flex items-center gap-2 mb-4">
              <HiOutlineHome className={`w-6 h-6 ${customStyles.textSecondary}`} />
              <h2 className={`text-lg font-bold ${customStyles.textPrimary}`}>Adresses</h2>
            </div>
            {addresses.length === 0 ? (
              <div className="text-gray-500">Aucune adresse enregistrée.</div>
            ) : (
              <ul className="space-y-2">
                {addresses.map(addr => (
                  <li key={addr.id} className={`flex items-center gap-2 bg-[#f8fbfa] rounded-lg px-3 py-2 border ${customStyles.borderColor}`}>
                    <span className="truncate">{addr.label} : {addr.address}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Paiements */}
          <section className={`bg-white rounded-2xl shadow p-6 border ${customStyles.borderColor}`}>
            <div className="flex items-center gap-2 mb-4">
              <HiOutlineCreditCard className="w-6 h-6 text-[#eb9f13]" />
              <h2 className={`text-lg font-bold ${customStyles.textPrimary}`}>Méthodes de paiement</h2>
              <button className={`ml-auto ${customStyles.textAccent} hover:${customStyles.hoverAccent} flex items-center gap-1 font-semibold`}>
                <HiOutlinePlus className="w-5 h-5" /> Ajouter
              </button>
            </div>
            <ul className="space-y-2">
              {payments.map(pay => (
                <li key={pay.id} className={`flex items-center gap-2 justify-between bg-[#f8fbfa] rounded-lg px-3 py-2 border ${customStyles.borderColor}`}>
                  <span>{pay.type} •••• {pay.last4} <span className="text-xs text-gray-400">(exp. {pay.expiry})</span></span>
                  <button className="text-red-500 hover:text-red-700"><HiOutlineTrash className="w-5 h-5" /></button>
                </li>
              ))}
            </ul>
          </section>

          {/* Abonnements */}
          <section className={`bg-white rounded-2xl shadow p-6 border ${customStyles.borderColor}`}>
            <div className="flex items-center gap-2 mb-4">
              <HiOutlineBadgeCheck className="w-6 h-6 text-blue-500" />
              <h2 className={`text-lg font-bold ${customStyles.textPrimary}`}>Abonnements</h2>
            </div>
            <ul className="space-y-2">
              {subscriptions.map(sub => (
                <li key={sub.id} className={`flex items-center gap-2 justify-between bg-[#f8fbfa] rounded-lg px-3 py-2 border ${customStyles.borderColor}`}>
                  <span>{sub.name}</span>
                  <span className={sub.status === 'Actif' ? 'text-green-600 font-semibold' : 'text-gray-400'}>{sub.status}</span>
                  <span className="text-xs text-gray-400">Renouvellement : {sub.renewal}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Commandes */}
          <section className={`bg-white rounded-2xl shadow p-6 border ${customStyles.borderColor}`}>
            <div className="flex items-center gap-2 mb-4">
              <HiOutlineClipboardList className="w-6 h-6 text-purple-500" />
              <h2 className={`text-lg font-bold ${customStyles.textPrimary}`}>Commandes</h2>
            </div>
            {Object.keys(ordersByYear).sort((a, b) => Number(b) - Number(a)).map(year => (
              <div key={year} className="mb-2">
                <h3 className="font-semibold text-gray-700 mb-1">{year}</h3>
                <ul className="space-y-1">
                  {ordersByYear[year].map((order: any) => (
                    <li key={order.id} className={`flex items-center gap-2 justify-between bg-[#f8fbfa] rounded-lg px-3 py-2 border ${customStyles.borderColor}`}>
                      <span>{order.ref} - {order.date} - {order.total}</span>
                      <button className={`${customStyles.textAccent} hover:${customStyles.hoverAccent} text-sm font-semibold`}>Télécharger la facture</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 