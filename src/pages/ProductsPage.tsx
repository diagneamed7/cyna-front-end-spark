import React, { useEffect, useState } from 'react';
import Header from '../components/Layout/Header';
import ProductCard from '../components/Cards/ProductCard';
import { getAllProducts } from '../services/api/ProductService';

function ProductsPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getAllProducts()
      .then(setProducts)
      .catch(err => console.error('Erreur:', err));
  }, []);

  return (
    <div className="products-container">
      <Header />
      <h1>Nos Produits</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        {products.map(product => (
          <ProductCard product={product} key={product.idProduit} />
        ))}
      </div>
    </div>
  );
}

export default ProductsPage;