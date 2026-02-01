import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { productsAPI } from '../services/api';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productsAPI.getById(id);
        setProduct(response.data.data);
        setSelectedImage(0);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const isAuthenticated = () => {
    return !!localStorage.getItem('token');
  };

  const handleAddToCart = () => {
    if (!isAuthenticated()) {
      setShowLoginModal(true);
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        description: product.description,
      });
    }

    // Show success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
    notification.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      <span>Produit ajouté au panier!</span>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 3000);
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

  const images = product?.image ? [product.image, ...(product.images || [])] : (product?.images || []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Produit non trouvé</h2>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Retour aux produits
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/products')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FiArrowLeft size={20} />
          <span>Retour aux produits</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          {images.length > 0 && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-96 object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? 'border-primary-600 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-24 object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="px-4 py-1 rounded-full text-white text-sm font-semibold"
                  style={{ backgroundColor: getCategoryColor(product.category) }}
                >
                  {product.category}
                </span>
                {product.stock > 0 ? (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    En stock
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                    Rupture de stock
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <p className="text-3xl font-bold text-primary-600 mb-6">
                {product.price.toLocaleString('fr-FR')} MAD
              </p>
            </div>

            {product.shortDescription && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description courte</h3>
                <p className="text-gray-600">{product.shortDescription}</p>
              </div>
            )}

            {product.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantité</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="px-6 py-2 text-lg font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
                {product.stock > 0 && (
                  <span className="text-sm text-gray-500">
                    {product.stock} disponible(s)
                  </span>
                )}
              </div>
            </div>

            {/* Add to Cart Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              disabled={!product.stock || product.stock === 0}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-semibold text-white transition-all shadow-lg ${
                product.stock > 0
                  ? 'bg-gradient-to-r from-[#C1121F] to-[#F77F00] hover:from-[#9a0e18] hover:to-[#c66600]'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <FiShoppingCart size={20} />
              {product.stock > 0 ? 'Ajouter au panier' : 'Rupture de stock'}
            </motion.button>

            {/* Product Details */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Détails du produit</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Catégorie</span>
                  <span className="font-semibold text-gray-900">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Prix</span>
                  <span className="font-semibold text-gray-900">
                    {product.price.toLocaleString('fr-FR')} MAD
                  </span>
                </div>
                {product.stock !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stock</span>
                    <span className="font-semibold text-gray-900">{product.stock || 0}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login/Signup Modal */}
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
                  navigate('/login', { state: { from: `/products/${id}` } });
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#C1121F] to-[#F77F00] text-white font-semibold rounded-lg hover:from-[#9a0e18] hover:to-[#c66600] transition-all shadow-md"
              >
                Se connecter
              </button>
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  navigate('/signup', { state: { from: `/products/${id}` } });
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
    </div>
  );
};

export default ProductDetail;
