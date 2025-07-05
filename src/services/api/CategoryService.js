const API_URL = 'http://172.16.1.32:3000';


export async function getAllCategories() {
  const res = await fetch(`${API_URL}/categories`);
  if (!res.ok) throw new Error('Erreur lors du chargement des catégories');
  return res.json();
}

export async function getCategoryById(id) {
  const res = await fetch(`${API_URL}/categories/${id}`);
  if (!res.ok) throw new Error('Catégorie introuvable');
  return res.json();
}