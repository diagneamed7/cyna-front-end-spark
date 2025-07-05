
const API_URL = 'http://192.168.1.53:3000';


export async function getAllProducts() {
  const res = await fetch(`${API_URL}/produits`);
  if (!res.ok) throw new Error('Erreur lors du chargement des produits');
  return res.json();
}

export async function getProductById(id) {
  const res = await fetch(`${API_URL}/produits/${id}`);
  if (!res.ok) throw new Error('Produit introuvable');
  return res.json();
}

// Ajoute d’autres fonctions si besoin (par catégorie, recherche, etc.)