import React from 'react';
import { Link } from 'react-router-dom';

function ProductCard({ product }) {
  // Fonction pour tronquer la description si elle est trop longue
  const truncate = (str, n) =>
    str && str.length > n ? str.slice(0, n - 1) + '…' : str;

  // Appel API pour ajouter au panier
  const handleAddToCart = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('actionculture_token');
    let panierId = localStorage.getItem('panierId');
    // Si panierId n'existe pas, on l'envoie comme null (création automatique côté back)
    const body = {
      produitId: product.idProduit,
      quantite: 1
    };
    if (panierId) {
      body.panierId = parseInt(panierId, 10);
    } else {
      body.panierId = null;
    }

    try {
      const res = await fetch('http://192.168.1.53:3000/produitpanier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error('Réponse API:', res.status, data);
        throw new Error('Erreur lors de l\'ajout au panier');
      }
      // Stocker le panierId retourné si besoin
      if (data.panierId) {
        localStorage.setItem('panierId', data.panierId.toString());
      }
      alert(`Produit "${product.nom}" ajouté au panier !`);
    } catch (err) {
      alert('Erreur lors de l\'ajout au panier');
    }
  };

  return (
    <Link
      to={`/produits/${product.idProduit}`}
      key={product.idProduit}
      style={{ textDecoration: 'none' }}
    >
      <div className="product-card improved">
        <div className="product-image-wrapper">
          <img
            src={product.image ? `http://172.16.1.32:3000/uploads/${product.image}` : '/placeholder.png'}
            alt={product.nom}
            className="product-image"
          />
          <span className="product-price-badge">{product.prix} €</span>
        </div>
        <div className="product-info">
          <h2 className="product-name">{product.nom}</h2>
          <p className="product-description">{truncate(product.description, 80)}</p>
          <button
            className="add-to-cart-btn"
            onClick={handleAddToCart}
          >
            Ajouter au panier
          </button>
        </div>
      </div>
      <style>{`
        .product-card.improved {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(44, 62, 80, 0.10);
          width: 260px;
          padding: 20px 20px 16px 20px;
          transition: transform 0.18s, box-shadow 0.18s;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          cursor: pointer;
        }
        .product-card.improved:hover {
          transform: translateY(-8px) scale(1.035);
          box-shadow: 0 8px 32px rgba(44, 62, 80, 0.18);
        }
        .product-image-wrapper {
          position: relative;
          width: 120px;
          height: 120px;
          margin-bottom: 16px;
        }
        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 10px;
          background: #eaeaea;
          box-shadow: 0 2px 8px rgba(44,62,80,0.07);
        }
        .product-price-badge {
          position: absolute;
          bottom: 8px;
          right: 8px;
          background: #2980b9;
          color: #fff;
          font-weight: bold;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 1rem;
          box-shadow: 0 1px 4px rgba(39,174,96,0.13);
        }
        .product-info {
          text-align: center;
        }
        .product-name {
          font-size: 1.18rem;
          color: #2980b9;
          margin: 0 0 8px 0;
          font-weight: 600;
        }
        .product-description {
          font-size: 0.97rem;
          color: #555;
          margin: 0;
          min-height: 38px;
        }
        .add-to-cart-btn {
          margin-top: 12px;
          background: #27ae60;
          color: #fff;
          border: none;
          padding: 8px 18px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.18s;
        }
        .add-to-cart-btn:hover {
          background: #219150;
        }
      `}</style>
    </Link>
  );
}

export default ProductCard;