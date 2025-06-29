
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, Grid, List, Filter, Search, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

const Catalogue = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    'Marketing Digital',
    'Productivité',
    'CRM & Ventes',
    'E-commerce',
    'Analytics',
    'Communication',
    'Design',
    'Développement'
  ];

  const priceRanges = [
    { label: 'Gratuit', value: 'free' },
    { label: '1€ - 19€', value: '1-19' },
    { label: '20€ - 49€', value: '20-49' },
    { label: '50€ - 99€', value: '50-99' },
    { label: '100€+', value: '100+' }
  ];

  const products = [
    {
      id: 1,
      name: "EmailPro Suite",
      description: "Solution complète d'email marketing avec automation avancée et analytics en temps réel",
      price: 29.99,
      rating: 4.8,
      reviews: 124,
      category: "Marketing Digital",
      image: "/placeholder.svg",
      isPopular: true,
      features: ["Automation", "Analytics", "A/B Testing", "CRM Integration"]
    },
    {
      id: 2,
      name: "TaskFlow Manager",
      description: "Gestionnaire de projets et tâches pour équipes agiles avec collaboration en temps réel",
      price: 19.99,
      rating: 4.6,
      reviews: 89,
      category: "Productivité",
      image: "/placeholder.svg",
      isNew: true,
      features: ["Kanban", "Time Tracking", "Team Chat", "Reporting"]
    },
    {
      id: 3,
      name: "SalesBoost CRM",
      description: "CRM intuitif avec pipeline de ventes automatisé et intelligence artificielle",
      price: 39.99,
      rating: 4.9,
      reviews: 156,
      category: "CRM & Ventes",
      image: "/placeholder.svg",
      isPopular: true,
      features: ["AI Insights", "Lead Scoring", "Mobile App", "Integration"]
    },
    {
      id: 4,
      name: "DesignPro Studio",
      description: "Outil de design collaboratif avec templates et assets premium",
      price: 24.99,
      rating: 4.7,
      reviews: 67,
      category: "Design",
      image: "/placeholder.svg",
      features: ["Templates", "Collaboration", "Version Control", "Assets"]
    },
    {
      id: 5,
      name: "Analytics Master",
      description: "Plateforme d'analytics avancée avec dashboards personnalisables",
      price: 49.99,
      rating: 4.5,
      reviews: 98,
      category: "Analytics",
      image: "/placeholder.svg",
      features: ["Real-time", "Custom Dashboards", "API", "Export"]
    },
    {
      id: 6,
      name: "ChatConnect",
      description: "Solution de communication d'équipe avec vidéoconférence intégrée",
      price: 15.99,
      rating: 4.4,
      reviews: 203,
      category: "Communication",
      image: "/placeholder.svg",
      features: ["Video Calls", "Screen Share", "File Share", "Integration"]
    }
  ];

  const ProductCard = ({ product }: { product: any }) => (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
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
      
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex-1 space-y-4">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                {product.name}
              </h3>
              <div className="text-right ml-4">
                <div className="font-bold text-lg">{product.price}€</div>
                <div className="text-xs text-muted-foreground">/mois</div>
              </div>
            </div>
            
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
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

            <div className="flex flex-wrap gap-1 mb-4">
              {product.features.slice(0, 3).map((feature: string) => (
                <Badge key={feature} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {product.features.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{product.features.length - 3}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button className="flex-1">
            <Link to={`/product/${product.id}`}>Voir détails</Link>
          </Button>
          <Button variant="outline">
            Essai gratuit
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const ProductListItem = ({ product }: { product: any }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex gap-6">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-24 h-24 object-cover rounded-lg"
          />
          
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  {product.isPopular && (
                    <Badge className="bg-orange-500 hover:bg-orange-600">Populaire</Badge>
                  )}
                  {product.isNew && (
                    <Badge className="bg-green-500 hover:bg-green-600">Nouveau</Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm mb-2">
                  {product.description}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="secondary">{product.category}</Badge>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{product.rating}</span>
                    <span className="text-muted-foreground">({product.reviews} avis)</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-xl">{product.price}€</div>
                <div className="text-sm text-muted-foreground mb-4">/mois</div>
                <div className="flex gap-2">
                  <Button>
                    <Link to={`/product/${product.id}`}>Détails</Link>
                  </Button>
                  <Button variant="outline">
                    Essai
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Catalogue SaaS</h1>
              <p className="text-muted-foreground mt-1">
                Découvrez et comparez plus de 500 outils SaaS
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher un outil..."
                  className="pl-10 w-64"
                />
              </div>
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtres
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 space-y-6`}>
            <div className="space-y-4">
              <h3 className="font-semibold">Catégories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox id={category} />
                    <label
                      htmlFor={category}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Prix par mois</h3>
              <div className="space-y-2">
                {priceRanges.map((range) => (
                  <div key={range.value} className="flex items-center space-x-2">
                    <Checkbox id={range.value} />
                    <label
                      htmlFor={range.value}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {range.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Note minimum</h3>
              <div className="space-y-2">
                {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <Checkbox id={`rating-${rating}`} />
                    <label
                      htmlFor={`rating-${rating}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                    >
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      {rating}+ étoiles
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {products.length} outils trouvés
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <Select defaultValue="popular">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Plus populaires</SelectItem>
                    <SelectItem value="rating">Mieux notés</SelectItem>
                    <SelectItem value="price-low">Prix croissant</SelectItem>
                    <SelectItem value="price-high">Prix décroissant</SelectItem>
                    <SelectItem value="newest">Plus récents</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <ProductListItem key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="flex justify-center mt-12">
              <div className="flex items-center space-x-2">
                <Button variant="outline" disabled>
                  Précédent
                </Button>
                <Button>1</Button>
                <Button variant="outline">2</Button>
                <Button variant="outline">3</Button>
                <Button variant="outline">
                  Suivant
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Catalogue;
