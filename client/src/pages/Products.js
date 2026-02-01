import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { productsAPI } from '../services/api';

const Products = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsAPI.getAll();
        setProducts(response.data.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Sample products data - fallback if API fails
  const fallbackProducts = [
    {
      id: 1,
      name: 'Camera de Surveillance HD',
      price: 1299,
      category: 'Cameras',
      image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400',
      description: 'Caméra de surveillance haute définition avec vision nocturne',
    },
    {
      id: 2,
      name: 'Extincteur à Poudre ABC',
      price: 450,
      category: 'Extincteurs',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
      description: 'Extincteur portatif pour feux de classe A, B et C',
    },
    {
      id: 3,
      name: 'Climatiseur Split 12000 BTU',
      price: 3499,
      category: 'Climatisation',
      image: 'https://images.unsplash.com/photo-1631540575400-4a0c0c4e0a5b?w=400',
      description: 'Système de climatisation split haute performance',
    },
    {
      id: 4,
      name: 'Alarme Intrusion Sans Fil',
      price: 899,
      category: 'Alarms',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      description: 'Système d\'alarme sans fil avec détecteurs de mouvement',
    },
    {
      id: 5,
      name: 'Contrôle d\'Accès Biométrique',
      price: 2499,
      category: 'Access Control',
      image: 'https://images.unsplash.com/photo-1614064641938-2c14c6d5e0a3?w=400',
      description: 'Système de contrôle d\'accès par empreinte digitale',
    },
    {
      id: 6,
      name: 'Chauffe-Eau Solaire 200L',
      price: 5999,
      category: 'Solar Water Heaters',
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400',
      description: 'Chauffe-eau solaire avec capteurs haute performance',
    },
    {
      id: 7,
      name: 'Camera IP WiFi',
      price: 799,
      category: 'Cameras',
      image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400',
      description: 'Caméra IP WiFi avec application mobile',
    },
    {
      id: 8,
      name: 'Extincteur CO2',
      price: 650,
      category: 'Extincteurs',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
      description: 'Extincteur au dioxyde de carbone pour équipements électriques',
    },
    {
      id: 9,
      name: 'Climatiseur Portable',
      price: 2299,
      category: 'Climatisation',
      image: 'https://images.unsplash.com/photo-1631540575400-4a0c0c4e0a5b?w=400',
      description: 'Climatiseur portable mobile et efficace',
    },
    {
      id: 10,
      name: 'Détecteur de Fumée',
      price: 199,
      category: 'Alarms',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      description: 'Détecteur de fumée intelligent avec alarme sonore',
    },
    {
      id: 11,
      name: 'Badge d\'Accès RFID',
      price: 150,
      category: 'Access Control',
      image: 'https://images.unsplash.com/photo-1614064641938-2c14c6d5e0a3?w=400',
      description: 'Badge RFID pour contrôle d\'accès',
    },
    {
      id: 12,
      name: 'Panneau Solaire 300W',
      price: 1299,
      category: 'Solar Water Heaters',
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400',
      description: 'Panneau solaire monocristallin haute efficacité',
    },
  ];

  const categories = [
    'All',
    'Cameras',
    'Extincteurs',
    'Climatisation',
    'Alarms',
    'Access Control',
    'Solar Water Heaters',
  ];

  // Use API products or fallback
  const allProducts = products.length > 0 ? products : fallbackProducts;

  // Filter products based on category and search query
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (product.description || product.shortDescription || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, allProducts]);

  const isAuthenticated = () => {
    return !!localStorage.getItem('token');
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    
    if (!isAuthenticated()) {
      setShowLoginModal(true);
      return;
    }

    addToCart({
      id: product._id || product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      description: product.description || product.shortDescription,
    });

    // Show success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-slide-in';
    notification.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      <span>Produit ajouté au panier!</span>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  };

  const handleImageClick = (product) => {
    const productId = product._id || product.id;
    navigate(`/products/${productId}`);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Cameras': '#C1121F',
      'Extincteurs': '#F77F00',
      'Climatisation': '#FCA311',
      'Alarms': '#C1121F',
      'Access Control': '#F77F00',
      'Solar Water Heaters': '#FCA311',
    };
    return colors[category] || '#1D1D1D';
  };

  return (
    <div className="pt-20 min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#C1121F] via-[#F77F00] to-[#FCA311] text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Nos Produits</h1>
            <p className="text-xl text-white/90">
              Découvrez notre gamme complète de produits de sécurité et de protection
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md mx-auto">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C1121F] focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  selectedCategory === category
                    ? 'bg-[#C1121F] text-white shadow-lg'
                    : 'bg-white text-[#1D1D1D] border-2 border-gray-300 hover:border-[#C1121F]'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Aucun produit trouvé</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow"
                >
                  {/* Product Image */}
                  {product.image && (
                    <div 
                      className="relative h-48 bg-gray-100 overflow-hidden cursor-pointer"
                      onClick={() => handleImageClick(product)}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      {/* Category Badge */}
                      <div
                        className="absolute top-3 right-3 px-3 py-1 rounded-full text-white text-xs font-semibold shadow-lg"
                        style={{ backgroundColor: getCategoryColor(product.category) }}
                      >
                        {product.category}
                      </div>
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-[#1D1D1D] mb-2 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">
                      {product.description}
                    </p>
                    
                    {/* Price */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-[#C1121F]">
                        {product.price.toLocaleString('fr-FR')} MAD
                      </span>
                    </div>

                    {/* Add to Cart Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => handleAddToCart(e, product)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#C1121F] to-[#F77F00] text-white font-semibold rounded-lg hover:from-[#9a0e18] hover:to-[#c66600] transition-all shadow-md"
                    >
                      <FiShoppingCart size={18} />
                      Ajouter au panier
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Login/Signup Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowLoginModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#C1121F] to-[#F77F00] rounded-full flex items-center justify-center mb-4">
                  <FiShoppingCart className="text-white" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Connexion requise
                </h2>
                <p className="text-gray-600">
                  Veuillez vous connecter ou créer un compte pour ajouter des produits à votre panier.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    navigate('/login', { state: { from: '/products' } });
                  }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#C1121F] to-[#F77F00] text-white font-semibold rounded-lg hover:from-[#9a0e18] hover:to-[#c66600] transition-all shadow-md"
                >
                  Se connecter
                </button>
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    navigate('/signup', { state: { from: '/products' } });
                  }}
                  className="w-full px-6 py-3 border-2 border-[#C1121F] text-[#C1121F] font-semibold rounded-lg hover:bg-[#C1121F] hover:text-white transition-all"
                >
                  Créer un compte
                </button>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="w-full px-6 py-3 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-all"
                >
                  Continuer sans compte
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Products;
