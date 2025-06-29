
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, User, Menu, Star, TrendingUp, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const featuredCategories = [
    {
      id: 1,
      name: "Marketing Digital",
      description: "Outils pour booster votre visibilité",
      icon: TrendingUp,
      productsCount: 45,
      color: "bg-blue-500"
    },
    {
      id: 2,
      name: "Productivité",
      description: "Solutions pour optimiser votre workflow",
      icon: Zap,
      productsCount: 32,
      color: "bg-green-500"
    },
    {
      id: 3,
      name: "CRM & Ventes",
      description: "Gérez vos relations clients",
      icon: Users,
      productsCount: 28,
      color: "bg-purple-500"
    }
  ];

  const topProducts = [
    {
      id: 1,
      name: "EmailPro Suite",
      description: "Solution complète d'email marketing avec automation avancée",
      price: 29.99,
      rating: 4.8,
      reviews: 124,
      category: "Marketing Digital",
      image: "/placeholder.svg",
      isPopular: true
    },
    {
      id: 2,
      name: "TaskFlow Manager",
      description: "Gestionnaire de projets et tâches pour équipes agiles",
      price: 19.99,
      rating: 4.6,
      reviews: 89,
      category: "Productivité",
      image: "/placeholder.svg",
      isNew: true
    },
    {
      id: 3,
      name: "SalesBoost CRM",
      description: "CRM intuitif avec pipeline de ventes automatisé",
      price: 39.99,
      rating: 4.9,
      reviews: 156,
      category: "CRM & Ventes",
      image: "/placeholder.svg",
      isPopular: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
              <span className="text-2xl font-bold text-foreground">Cyna</span>
            </Link>

            {/* Navigation Desktop */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/catalogue" className="text-sm font-medium hover:text-primary transition-colors">
                Catalogue
              </Link>
              <Link to="/categories" className="text-sm font-medium hover:text-primary transition-colors">
                Catégories
              </Link>
              <Link to="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
                Tarifs
              </Link>
              <Link to="/contact" className="text-sm font-medium hover:text-primary transition-colors">
                Contact
              </Link>
            </nav>

            {/* Search Bar */}
            <div className="hidden sm:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Rechercher un service SaaS..."
                  className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/cart" className="flex items-center space-x-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Panier</span>
                  <Badge variant="secondary" className="ml-1">3</Badge>
                </Link>
              </Button>
              
              <Button variant="ghost" size="sm">
                <Link to="/login" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Connexion</span>
                </Link>
              </Button>

              <Button className="hidden sm:inline-flex">
                <Link to="/register">S'inscrire</Link>
              </Button>

              {/* Mobile Menu */}
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                Découvrez les meilleurs
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  outils SaaS
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Explorez notre marketplace de solutions SaaS sélectionnées pour booster votre productivité 
                et faire croître votre business
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8">
                <Link to="/catalogue">Explorer le catalogue</Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8">
                <Link to="/demo">Voir la démo</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-md mx-auto pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Outils SaaS</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">10k+</div>
                <div className="text-sm text-muted-foreground">Utilisateurs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">4.9★</div>
                <div className="text-sm text-muted-foreground">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold">Explorez par catégorie</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Trouvez exactement ce dont vous avez besoin parmi nos catégories soigneusement organisées
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCategories.map((category) => (
              <Card key={category.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`${category.color} p-3 rounded-lg text-white`}>
                      <category.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-3">
                        {category.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {category.productsCount} outils
                        </span>
                        <Button variant="ghost" size="sm" className="text-xs">
                          Voir tout →
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Top Products Section */}
      <section className="py-16 lg:py-24 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold">Produits populaires</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Découvrez les outils SaaS les plus appréciés par notre communauté
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="relative">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    {product.isPopular && (
                      <Badge className="bg-orange-500 hover:bg-orange-600">
                        Populaire
                      </Badge>
                    )}
                    {product.isNew && (
                      <Badge className="bg-green-500 hover:bg-green-600">
                        Nouveau
                      </Badge>
                    )}
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <div className="text-right">
                          <div className="font-bold text-lg">{product.price}€</div>
                          <div className="text-xs text-muted-foreground">/mois</div>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground text-sm mb-3">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="secondary" className="text-xs">
                          {product.category}
                        </Badge>
                        <div className="flex items-center space-x-1 text-sm">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{product.rating}</span>
                          <span className="text-muted-foreground">({product.reviews})</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button className="flex-1">
                        <Link to={`/product/${product.id}`}>Voir détails</Link>
                      </Button>
                      <Button variant="outline" size="icon">
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              <Link to="/catalogue">Voir tous les produits</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8 text-white">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Prêt à booster votre business ?
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Rejoignez des milliers d'entrepreneurs qui ont fait confiance à Cyna 
              pour trouver les meilleurs outils SaaS
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                <Link to="/register">Créer un compte gratuit</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 border-white text-white hover:bg-white hover:text-primary">
                <Link to="/contact">Nous contacter</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
                <span className="text-2xl font-bold">Cyna</span>
              </Link>
              <p className="text-muted-foreground text-sm">
                La marketplace de référence pour découvrir et comparer les meilleurs outils SaaS.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Produits</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/catalogue" className="hover:text-foreground transition-colors">Catalogue</Link></li>
                <li><Link to="/categories" className="hover:text-foreground transition-colors">Catégories</Link></li>
                <li><Link to="/new" className="hover:text-foreground transition-colors">Nouveautés</Link></li>
                <li><Link to="/popular" className="hover:text-foreground transition-colors">Populaires</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/help" className="hover:text-foreground transition-colors">Centre d'aide</Link></li>
                <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
                <li><Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
                <li><Link to="/status" className="hover:text-foreground transition-colors">Statut</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-foreground transition-colors">À propos</Link></li>
                <li><Link to="/careers" className="hover:text-foreground transition-colors">Carrières</Link></li>
                <li><Link to="/press" className="hover:text-foreground transition-colors">Presse</Link></li>
                <li><Link to="/legal" className="hover:text-foreground transition-colors">Mentions légales</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Cyna. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
