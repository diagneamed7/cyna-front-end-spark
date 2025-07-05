import React from 'react';

function ProductDetail({ product }) {
  if (!product) return null;

  return (
    <div className="product-detail-card">
      <img
        src={product.image ? `http://172.16.1.32:3000/uploads/${product.image}` : '/placeholder.png'}
        alt={product.nom}
        className="product-detail-image"
      />
      <div className="product-detail-info">
        <h1 className="product-detail-name">{product.nom}</h1>
        <p className="product-detail-price">{product.prix} €</p>
        <p className="product-detail-description">{product.description}</p>
        <p>Stock : {product.stock}</p>
        <p>Catégorie : {product.categorie?.nom}</p>
      </div>
      <style>{`
        .product-detail-card {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(44, 62, 80, 0.08);
          padding: 32px;
          display: flex;
          gap: 32px;
          align-items: flex-start;
          max-width: 800px;
          margin: 40px auto;
        }
        .product-detail-image {
          width: 240px;
          height: 240px;
          object-fit: cover;
          border-radius: 8px;
          background: #eaeaea;
        }
        .product-detail-info {
          flex: 1;
        }
        .product-detail-name {
          font-size: 2rem;
          color: #2980b9;
          margin-bottom: 16px;
        }
        .product-detail-price {
          font-weight: bold;
          color: #2980b9;
          margin-bottom: 16px;
        }
        .product-detail-description {
          font-size: 1.1rem;
          color: #555;
        }
      `}</style>
    </div>
  );
}

export default ProductDetail;