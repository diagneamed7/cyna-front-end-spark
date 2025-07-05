import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Layout/Header';
import { getProductById } from '../services/api/ProductService';
import ProductDetail from '../components/Cards/ProductDetail';

function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProductById(id)
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erreur:', error);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Chargement...</div>;
  if (!product) return <div>Produit introuvable.</div>;

  return (
    <div className="product-detail-container">
      <Header />
      <ProductDetail product={product} />
    </div>
  );
}

export default ProductDetailPage;