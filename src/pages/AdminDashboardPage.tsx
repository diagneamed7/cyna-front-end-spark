// src/pages/AdminDashboardPage.tsx - Dashboard d'administration avec CRUD produits/catégories

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  HiSquares2X2,
  HiTag,
  HiPlus,
  HiPencil,
  HiTrash,
  HiEye,
  HiXMark,
  HiCheck,
  HiExclamationTriangle,
  HiArrowLeft,
  HiCog6Tooth as Settings
} from 'react-icons/hi2';
import { useAuth } from '../hooks/useAuth';
import { useAdmin } from '../hooks/useAdmin';
import { Loading, Alert, Modal, ConfirmationModal } from '../components/UI';
import { productService, type Product, type CreateProductRequest, type UpdateProductRequest } from '../services/api/products';
import { categoryService, type Category, type CreateCategoryRequest, type UpdateCategoryRequest } from '../services/api/categories';

const AdminDashboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { 
    isAdmin, 
    canCreateProducts, 
    canEditProducts, 
    canDeleteProducts,
    canCreateCategories,
    canEditCategories,
    canDeleteCategories,
    canViewAdminPanel 
  } = useAdmin();
  
  // 🧪 MODE TEST TEMPORAIRE - À SUPPRIMER EN PRODUCTION
  const [testMode, setTestMode] = useState(false);
  const testUser = {
    id: 1,
    email: 'admin@test.com',
    nom: 'Admin',
    prenom: 'Test',
    Roles: [{ nom_role: 'Admin' }]
  };
  
  const isTestMode = testMode || import.meta.env.DEV;
  const currentUser = isTestMode ? testUser : user;
  const currentIsAuthenticated = isTestMode ? true : isAuthenticated;
  const currentIsAdmin = isTestMode ? true : isAdmin;
  const currentCanViewAdminPanel = isTestMode ? true : canViewAdminPanel;
  const currentCanCreateProducts = isTestMode ? true : canCreateProducts;
  const currentCanEditProducts = isTestMode ? true : canEditProducts;
  const currentCanDeleteProducts = isTestMode ? true : canDeleteProducts;
  const currentCanCreateCategories = isTestMode ? true : canCreateCategories;
  const currentCanEditCategories = isTestMode ? true : canEditCategories;
  const currentCanDeleteCategories = isTestMode ? true : canDeleteCategories;
  
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour les produits
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  // États pour les modales
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState<'product' | 'category'>('product');
  
  // États pour les formulaires
  const [productForm, setProductForm] = useState<CreateProductRequest>({
    nom: '',
    description: '',
    prix: 0,
    stock: 0,
    categorie_id: 0,
    image: '',
    statut: 'actif'
  });
  
  const [categoryForm, setCategoryForm] = useState<CreateCategoryRequest>({
    nom: '',
    description: '',
    image: '',
    statut: 'actif'
  });

  // Redirection si pas admin
  useEffect(() => {
    if (!isLoading && (!currentIsAuthenticated || !currentCanViewAdminPanel)) {
      window.location.href = '/';
    }
  }, [currentIsAuthenticated, isLoading, currentCanViewAdminPanel]);

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Charger les catégories en premier (nécessaires pour les produits)
        const categoriesData = await categoryService.getAllCategories();
        let categoriesArray = [];
        if (Array.isArray(categoriesData)) {
          categoriesArray = categoriesData;
        } else if (categoriesData && Array.isArray(categoriesData.categories)) {
          categoriesArray = categoriesData.categories;
        } else if (categoriesData && Array.isArray(categoriesData.data)) {
          categoriesArray = categoriesData.data;
        }
        setCategories(categoriesArray);

        // Charger les produits
        const productsResponse = await productService.getProducts(1, 50);
        setProducts(productsResponse.products);
        
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentIsAuthenticated && currentCanViewAdminPanel) {
      loadData();
    }
  }, [currentIsAuthenticated, currentCanViewAdminPanel]);

  // Gestionnaires pour les produits
  const handleCreateProduct = () => {
    if (!currentCanCreateProducts) {
      setError('Vous n\'avez pas les permissions pour créer des produits');
      return;
    }
    
    setSelectedProduct(null);
    setProductForm({
      nom: '',
      description: '',
      prix: 0,
      stock: 0,
      categorie_id: categories[0]?.idCategorie || 0,
      image: '',
      statut: 'actif'
    });
    setShowProductModal(true);
  };

  const handleEditProduct = (product: Product) => {
    if (!currentCanEditProducts) {
      setError('Vous n\'avez pas les permissions pour modifier des produits');
      return;
    }
    
    setSelectedProduct(product);
    setProductForm({
      nom: product.nom,
      description: product.description,
      prix: product.prix,
      stock: product.stock || 0,
      categorie_id: product.categorie.idCategorie,
      image: product.image || '',
      statut: product.statut || 'actif'
    });
    setShowProductModal(true);
  };

  const handleDeleteProduct = (product: Product) => {
    if (!currentCanDeleteProducts) {
      setError('Vous n\'avez pas les permissions pour supprimer des produits');
      return;
    }
    
    setSelectedProduct(product);
    setDeleteType('product');
    setShowDeleteModal(true);
  };

  const handleSaveProduct = async () => {
    try {
      setError(null);
      let dataToSend = { ...productForm };
      if (!dataToSend.image) {
        delete dataToSend.image;
      }
      if (selectedProduct) {
        // Mise à jour
        if (!currentCanEditProducts) {
          setError('Vous n\'avez pas les permissions pour modifier des produits');
          return;
        }
        const updateData: UpdateProductRequest = {
          idProduit: selectedProduct.idProduit,
          ...dataToSend
        };
        const updatedProduct = await productService.updateProduct(updateData);
        setProducts(prev => prev.map(p => p.idProduit === selectedProduct.idProduit ? updatedProduct : p));
      } else {
        // Création
        if (!currentCanCreateProducts) {
          setError('Vous n\'avez pas les permissions pour créer des produits');
          return;
        }
        const newProduct = await productService.createProduct(dataToSend);
        setProducts(prev => [...prev, newProduct]);
      }
      setShowProductModal(false);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du produit:', err);
      setError('Erreur lors de la sauvegarde du produit');
    }
  };

  // Gestionnaires pour les catégories
  const handleCreateCategory = () => {
    if (!currentCanCreateCategories) {
      setError('Vous n\'avez pas les permissions pour créer des catégories');
      return;
    }
    
    setSelectedCategory(null);
    setCategoryForm({
      nom: '',
      description: '',
      image: '',
      statut: 'actif'
    });
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: Category) => {
    if (!currentCanEditCategories) {
      setError('Vous n\'avez pas les permissions pour modifier des catégories');
      return;
    }
    
    setSelectedCategory(category);
    setCategoryForm({
      nom: category.nom,
      description: category.description,
      image: category.image || '',
      statut: category.statut || 'actif'
    });
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = (category: Category) => {
    if (!currentCanDeleteCategories) {
      setError('Vous n\'avez pas les permissions pour supprimer des catégories');
      return;
    }
    
    setSelectedCategory(category);
    setDeleteType('category');
    setShowDeleteModal(true);
  };

  const handleSaveCategory = async () => {
    try {
      setError(null);
      let dataToSend = { ...categoryForm };
      if (!dataToSend.image) {
        delete dataToSend.image;
      }
      if (selectedCategory) {
        // Mise à jour
        if (!currentCanEditCategories) {
          setError('Vous n\'avez pas les permissions pour modifier des catégories');
          return;
        }
        const updateData: UpdateCategoryRequest = {
          idCategorie: selectedCategory.idCategorie,
          ...dataToSend
        };
        const updatedCategory = await categoryService.updateCategory(updateData);
        setCategories(prev => prev.map(c => c.idCategorie === selectedCategory.idCategorie ? updatedCategory : c));
      } else {
        // Création
        if (!currentCanCreateCategories) {
          setError('Vous n\'avez pas les permissions pour créer des catégories');
          return;
        }
        const newCategory = await categoryService.createCategory(dataToSend);
        setCategories(prev => [...prev, newCategory]);
      }
      setShowCategoryModal(false);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde de la catégorie:', err);
      setError('Erreur lors de la sauvegarde de la catégorie');
    }
  };

  // Gestionnaire de suppression
  const handleConfirmDelete = async () => {
    try {
      setError(null);
      
      if (deleteType === 'product' && selectedProduct) {
        if (!currentCanDeleteProducts) {
          setError('Vous n\'avez pas les permissions pour supprimer des produits');
          return;
        }
        
        await productService.deleteProduct(selectedProduct.idProduit);
        setProducts(prev => prev.filter(p => p.idProduit !== selectedProduct.idProduit));
      } else if (deleteType === 'category' && selectedCategory) {
        if (!currentCanDeleteCategories) {
          setError('Vous n\'avez pas les permissions pour supprimer des catégories');
          return;
        }
        
        await categoryService.deleteCategory(selectedCategory.idCategorie);
        setCategories(prev => prev.filter(c => c.idCategorie !== selectedCategory.idCategorie));
      }
      
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError('Erreur lors de la suppression');
    }
  };

  if (isLoading) {
    return <Loading overlay text="Chargement de l'administration..." />;
  }

  if (!currentIsAuthenticated || !currentCanViewAdminPanel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <HiExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
          <p className="text-gray-600">
            {!currentIsAuthenticated 
              ? 'Vous devez être connecté pour accéder à cette page.'
              : 'Vous n\'avez pas les permissions d\'administrateur nécessaires.'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <a
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <HiArrowLeft className="w-5 h-5" />
                <span>Retour</span>
              </a>
              <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Settings className="w-5 h-5" />
              <span>Admin: {currentUser?.prenom} {currentUser?.nom}</span>
              {import.meta.env.DEV && (
                <button
                  onClick={() => setTestMode(!testMode)}
                  className={`px-2 py-1 text-xs rounded ${
                    testMode 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {testMode ? 'Mode Test ON' : 'Mode Test OFF'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Affichage des erreurs */}
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError(null)}
            className="mb-6"
          />
        )}

        {/* Onglets */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <HiSquares2X2 className="w-5 h-5 inline mr-2" />
                Produits ({Array.isArray(products) ? products.length : 0})
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'categories'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <HiTag className="w-5 h-5 inline mr-2" />
                Catégories ({Array.isArray(categories) ? categories.length : 0})
              </button>
            </nav>
          </div>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'products' && (
          <div>
            {/* Header produits */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Gestion des produits</h2>
              {currentCanCreateProducts && (
                <button
                  onClick={handleCreateProduct}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <HiPlus className="w-5 h-5" />
                  Nouveau produit
                </button>
              )}
            </div>

            {/* Liste des produits */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Catégorie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prix
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      {(currentCanEditProducts || currentCanDeleteProducts) && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.isArray(products) && products.map((product) => (
                      <tr key={product.idProduit} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-lg object-cover"
                                src={product.image || '/images/placeholder.jpg'}
                                alt={product.nom}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product.nom}
                              </div>
                              <div className="text-sm text-gray-500">
                                {product.description.substring(0, 50)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.categorie.nom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {productService.formatPrice(product.prix)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.stock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.statut === 'actif'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.statut === 'actif' ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        {(currentCanEditProducts || currentCanDeleteProducts) && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              {currentCanEditProducts && (
                                <button
                                  onClick={() => handleEditProduct(product)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Modifier le produit"
                                >
                                  <HiPencil className="w-4 h-4" />
                                </button>
                              )}
                              {currentCanDeleteProducts && (
                                <button
                                  onClick={() => handleDeleteProduct(product)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Supprimer le produit"
                                >
                                  <HiTrash className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div>
            {/* Header catégories */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Gestion des catégories</h2>
              {currentCanCreateCategories && (
                <button
                  onClick={handleCreateCategory}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <HiPlus className="w-5 h-5" />
                  Nouvelle catégorie
                </button>
              )}
            </div>

            {/* Liste des catégories */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Catégorie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produits
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      {(currentCanEditCategories || currentCanDeleteCategories) && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.isArray(categories) && categories.map((category) => (
                      <tr key={category.idCategorie} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-lg object-cover"
                                src={category.image || '/images/placeholder.jpg'}
                                alt={category.nom}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {category.nom}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {category.description.substring(0, 100)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {categoryService.formatProductCount(category.nombre_produits || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            category.statut === 'actif'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {category.statut === 'actif' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        {(currentCanEditCategories || currentCanDeleteCategories) && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              {currentCanEditCategories && (
                                <button
                                  onClick={() => handleEditCategory(category)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Modifier la catégorie"
                                >
                                  <HiPencil className="w-4 h-4" />
                                </button>
                              )}
                              {currentCanDeleteCategories && (
                                <button
                                  onClick={() => handleDeleteCategory(category)}
                                  className="text-red-600 hover:text-red-900"
                                  disabled={categoryService.hasProducts(category)}
                                  title={categoryService.hasProducts(category) ? 'Impossible de supprimer une catégorie avec des produits' : 'Supprimer la catégorie'}
                                >
                                  <HiTrash className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Produit */}
      <Modal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        title={selectedProduct ? 'Modifier le produit' : 'Nouveau produit'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du produit *
              </label>
              <input
                type="text"
                value={productForm.nom}
                onChange={(e) => setProductForm(prev => ({ ...prev, nom: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nom du produit"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie *
              </label>
              <select
                value={productForm.categorie_id}
                onChange={(e) => setProductForm(prev => ({ ...prev, categorie_id: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={0}>Sélectionner une catégorie</option>
                {categories.map(category => (
                  <option key={category.idCategorie} value={category.idCategorie}>
                    {category.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={productForm.description}
              onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Description du produit"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix (€) *
              </label>
              <input
                type="number"
                step="0.01"
                value={productForm.prix}
                onChange={(e) => setProductForm(prev => ({ ...prev, prix: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock *
              </label>
              <input
                type="number"
                value={productForm.stock}
                onChange={(e) => setProductForm(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                value={productForm.statut}
                onChange={(e) => setProductForm(prev => ({ ...prev, statut: e.target.value as 'actif' | 'inactif' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL de l'image
            </label>
            <input
              type="url"
              value={productForm.image}
              onChange={(e) => setProductForm(prev => ({ ...prev, image: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setShowProductModal(false)}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSaveProduct}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {selectedProduct ? 'Modifier' : 'Créer'}
          </button>
        </div>
      </Modal>

      {/* Modal Catégorie */}
      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title={selectedCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la catégorie *
            </label>
            <input
              type="text"
              value={categoryForm.nom}
              onChange={(e) => setCategoryForm(prev => ({ ...prev, nom: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nom de la catégorie"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={categoryForm.description}
              onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Description de la catégorie"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL de l'image
              </label>
              <input
                type="url"
                value={categoryForm.image}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, image: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                value={categoryForm.statut}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, statut: e.target.value as 'actif' | 'inactif' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="actif">Active</option>
                <option value="inactif">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setShowCategoryModal(false)}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSaveCategory}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {selectedCategory ? 'Modifier' : 'Créer'}
          </button>
        </div>
      </Modal>

      {/* Modal de confirmation de suppression */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer ce ${deleteType === 'product' ? 'produit' : 'catégorie'} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
};

export default AdminDashboardPage; 