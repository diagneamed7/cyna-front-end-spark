import React, { useEffect, useState } from 'react';
import Header from '../components/Layout/Header';
import ProductCard from '../components/Cards/ProductCard';
import { getAllProducts } from '../services/api/productService';
import { getAllCategories } from '../services/api/categoryService';

function ProductSearchPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categorie, setCategorie] = useState('');
  const [minPrix, setMinPrix] = useState('');
  const [maxPrix, setMaxPrix] = useState('');
  const [sortBy, setSortBy] = useState('nom');
  const [order, setOrder] = useState('asc');
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    getAllProducts().then(setProducts).catch(err => console.error('Erreur:', err));
    getAllCategories().then(setCategories).catch(err => console.error('Erreur:', err));
  }, []);

  useEffect(() => {
    let result = products;

    if (search)
      result = result.filter(
        p =>
          p.nom.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase())
      );

    if (categorie)
      result = result.filter(
        p => p.categorie && p.categorie.idCategorie === parseInt(categorie)
      );

    if (minPrix)
      result = result.filter(p => p.prix >= parseFloat(minPrix));

    if (maxPrix)
      result = result.filter(p => p.prix <= parseFloat(maxPrix));

    // Tri
    result = [...result].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (sortBy === 'nom') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }
      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });

    setFiltered(result);
  }, [search, categorie, minPrix, maxPrix, sortBy, order, products]);

  return (
    <div className="search-page-container">
      <Header />
      <div className="search-header">
        <h1>Recherche de produits</h1>
        <div className="filters-row">
          <input
            type="text"
            placeholder="Nom ou description"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
          <select
            value={categorie}
            onChange={e => setCategorie(e.target.value)}
            className="search-select"
          >
            <option value="">Toutes catégories</option>
            {categories.map(cat => (
              <option key={cat.idCategorie} value={cat.idCategorie}>
                {cat.nom}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Prix min"
            value={minPrix}
            onChange={e => setMinPrix(e.target.value)}
            className="search-input"
            min="0"
          />
          <input
            type="number"
            placeholder="Prix max"
            value={maxPrix}
            onChange={e => setMaxPrix(e.target.value)}
            className="search-input"
            min="0"
          />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="search-select"
          >
            <option value="nom">Nom</option>
            <option value="prix">Prix</option>
          </select>
          <select
            value={order}
            onChange={e => setOrder(e.target.value)}
            className="search-select"
          >
            <option value="asc">Croissant</option>
            <option value="desc">Décroissant</option>
          </select>
        </div>
      </div>
      <div className="products-list-centered">
        {filtered.map(product => (
          <ProductCard product={product} key={product.idProduit} />
        ))}
        {filtered.length === 0 && (
          <div className="no-result">Aucun produit trouvé.</div>
        )}
      </div>
      <style>{`
        .search-page-container {
          min-height: 100vh;
          background: #f8f9fa;
          padding-bottom: 48px;
        }
        .search-header {
          max-width: 900px;
          margin: 40px auto 32px auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .search-header h1 {
          font-family: 'Montserrat', sans-serif;
          color: #2c3e50;
          margin-bottom: 24px;
          font-size: 2rem;
        }
        .filters-row {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          justify-content: center;
          width: 100%;
          margin-bottom: 8px;
        }
        .search-input, .search-select {
          padding: 12px 14px;
          font-size: 1rem;
          border-radius: 8px;
          border: 1.5px solid #2980b9;
          outline: none;
          background: #fff;
          min-width: 120px;
        }
        .search-input:focus, .search-select:focus {
          border: 2px solid #2980b9;
          box-shadow: 0 0 0 2px #2980b930;
        }
        .products-list-centered {
          display: flex;
          flex-wrap: wrap;
          gap: 32px;
          justify-content: center;
          align-items: flex-start;
          margin-top: 24px;
        }
        .no-result {
          color: #888;
          font-size: 1.1rem;
          margin-top: 32px;
        }
        @media (max-width: 900px) {
          .filters-row {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
}

export default ProductSearchPage;