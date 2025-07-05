import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Layout/Header';
import { getAllProducts } from '../services/api/ProductService';
import { getAllCategories } from '../services/api/CategoryService';
import ProductCard from '../components/Cards/ProductCard';

function CategoryDetailPage() {
  const { id } = useParams();
  const [categorie, setCategorie] = useState(null);
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllCategories(), getAllProducts()])
      .then(([categories, products]) => {
        const cat = categories.find(c => c.idCategorie === parseInt(id));
        setCategorie(cat);
        const filtered = products.filter(
          p => p.categorie && p.categorie.idCategorie === parseInt(id)
        );
        setProduits(filtered);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Chargement...</div>;
  if (!categorie) return <div>Catégorie introuvable.</div>;

  return (
    <div className="category-detail-container">
      <Header />
      <h1>{categorie.nom}</h1>
      <h2>Produits de cette catégorie</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center' }}>
        {produits.map(prod => (
          <ProductCard product={prod} key={prod.idProduit} />
        ))}
        {produits.length === 0 && <p>Aucun produit dans cette catégorie.</p>}
      </div>
    </div>
  );
}

export default CategoryDetailPage;