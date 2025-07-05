import React from 'react';
import { Link } from 'react-router-dom';

function CategoryCard({ category }) {
  return (
    <Link
      to={`/categories/${category.idCategorie}`}
      key={category.idCategorie}
      style={{ textDecoration: 'none' }}
    >
      <div className="category-card improved">
        <div className="category-image-wrapper">
          <img
            src={category.image ? `http://172.16.1.32:3000/uploads/${category.image}` : '/placeholder.png'}
            alt={category.nom}
            className="category-image"
          />
        </div>
        <div className="category-info">
          <h2 className="category-name">{category.nom}</h2>
          <p className="category-description">{category.description}</p>
        </div>
      </div>
      <style>{`
        .category-card.improved {
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
        .category-card.improved:hover {
          transform: translateY(-8px) scale(1.035);
          box-shadow: 0 8px 32px rgba(44, 62, 80, 0.18);
        }
        .category-image-wrapper {
          width: 120px;
          height: 120px;
          margin-bottom: 16px;
        }
        .category-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 10px;
          background: #eaeaea;
          box-shadow: 0 2px 8px rgba(44,62,80,0.07);
        }
        .category-info {
          text-align: center;
        }
        .category-name {
          font-size: 1.18rem;
          color: #2980b9;
          margin: 0 0 8px 0;
          font-weight: 600;
        }
        .category-description {
          font-size: 0.97rem;
          color: #555;
          margin: 0;
          min-height: 38px;
        }
      `}</style>
    </Link>
  );
}

export default CategoryCard;