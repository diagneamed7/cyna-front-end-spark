const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const authMiddleware = require('../middleware/AuthMiddleware'); // à adapter selon ton projet
const addressController = require('../controllers/AddressController');
const paymentMethodController = require('../controllers/PaymentMethodController');

// ==================== PROFIL UTILISATEUR ====================
// Obtenir le profil de l'utilisateur connecté
router.get('/profile', authMiddleware, userController.getProfile);
// Modifier le profil de l'utilisateur connecté
router.put('/profile', authMiddleware, userController.updateProfile);

// ==================== UTILISATEURS ====================
// Obtenir toutes les users
router.get('/', userController.getAll);
// Créer une nouvelle user
router.post('/', userController.create);
// Obtenir une user par son ID
router.get('/:id', userController.getById);
// Modifier une user existante (par ID)
router.put('/:id', userController.update);
// Supprimer une user
router.delete('/:id', userController.delete);

// ==================== ADRESSES UTILISATEUR ====================
router.get('/addresses', authMiddleware, addressController.getAll);
router.post('/addresses', authMiddleware, addressController.create);
router.put('/addresses/:id', authMiddleware, addressController.update);
router.delete('/addresses/:id', authMiddleware, addressController.delete);

// ==================== MOYENS DE PAIEMENT UTILISATEUR ====================
router.get('/payments', authMiddleware, paymentMethodController.getAll);
router.post('/payments', authMiddleware, paymentMethodController.create);
router.delete('/payments/:id', authMiddleware, paymentMethodController.delete);

module.exports = router; 