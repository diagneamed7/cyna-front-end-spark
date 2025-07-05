import React, { useEffect, useState } from 'react';
import Header from '../components/Layout/Header';
import CategoryCard from '../components/Cards/CategoryCard';
import { getAllCategories } from '../services/api/CategoryService';

function CategoriesPage() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getAllCategories()
      .then(setCategories)
      .catch(err => console.error('Erreur:', err));
  }, []);

  return (
    <div className="categories-container">
      <Header />
      <h1>Nos catégories</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center' }}>
        {categories.map(cat => (
          <CategoryCard category={cat} key={cat.idCategorie} />
        ))}
      </div>
    </div>
  );
}

export default CategoriesPage;