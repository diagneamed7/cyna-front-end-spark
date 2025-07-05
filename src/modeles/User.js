const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Définir le modèle User
const User = sequelize.define('User', {
  idUser: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  prenom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  secretMfa:{
    type: DataTypes.STRING,
    allowNull:true,
  },
  telephone: {
    type: DataTypes.STRING, // STRING ou BIGINT si tu veux garder tous les formats
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
  },
  date_inscription: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

// 🔁 Tu dois importer le modèle "abonnement" si tu veux l'utiliser
// const Abonnement = require('./Abonnement');
// User.belongsTo(Abonnement, { foreignKey: 'id_ab', as: 'abonnement' });

module.exports = User; 