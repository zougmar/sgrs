import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, getCartItemsCount, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (cart.length === 0) return;
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="bg-white rounded-2xl shadow-xl p-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="mb-6"
              >
                <FiShoppingCart size={100} className="mx-auto text-gray-300" />
              </motion.div>
              <h1 className="text-3xl font-bold text-[#1D1D1D] mb-4">Votre panier est vide</h1>
              <p className="text-gray-600 mb-8">
                Ajoutez des produits à votre panier pour commencer vos achats
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#C1121F] to-[#F77F00] text-white font-semibold rounded-lg hover:from-[#9a0e18] hover:to-[#c66600] transition-all shadow-lg"
              >
                <FiShoppingBag size={20} />
                Voir les produits
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-[#C1121F] mb-4 transition-colors"
          >
            <FiArrowLeft className="mr-2" size={20} />
            Retour
          </button>
          <h1 className="text-4xl font-bold text-[#1D1D1D] mb-2">Mon Panier</h1>
          <p className="text-gray-600">
            {getCartItemsCount()} {getCartItemsCount() > 1 ? 'articles' : 'article'} dans votre panier
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Product Image */}
                  <div className="sm:w-48 h-48 sm:h-auto bg-gray-100 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                      }}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-[#1D1D1D] mb-2">{item.name}</h3>
                          <p className="text-sm text-gray-500 mb-2">Catégorie: {item.category}</p>
                          <p className="text-2xl font-bold text-[#C1121F]">
                            {item.price.toLocaleString('fr-FR')} MAD
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <FiTrash2 size={20} />
                        </button>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-700">Quantité:</span>
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-[#C1121F] hover:bg-[#C1121F] hover:text-white transition-all"
                          >
                            <FiMinus size={18} />
                          </motion.button>
                          <span className="w-12 text-center font-bold text-lg text-[#1D1D1D]">
                            {item.quantity}
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-[#C1121F] hover:bg-[#C1121F] hover:text-white transition-all"
                          >
                            <FiPlus size={18} />
                          </motion.button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Sous-total</p>
                        <p className="text-xl font-bold text-[#C1121F]">
                          {(item.price * item.quantity).toLocaleString('fr-FR')} MAD
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-[#1D1D1D] mb-6">Résumé de la commande</h2>

              {/* Summary Items */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total ({getCartItemsCount()} articles)</span>
                  <span className="font-semibold">{getCartTotal().toLocaleString('fr-FR')} MAD</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Livraison</span>
                  <span className="font-semibold">À calculer</span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-[#1D1D1D]">Total</span>
                    <span className="text-2xl font-bold text-[#C1121F]">
                      {getCartTotal().toLocaleString('fr-FR')} MAD
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  className="w-full py-4 bg-gradient-to-r from-[#C1121F] to-[#F77F00] text-white font-semibold rounded-lg hover:from-[#9a0e18] hover:to-[#c66600] transition-all shadow-lg text-lg"
                >
                  Passer la commande
                </motion.button>
                <Link
                  to="/products"
                  className="block w-full py-3 text-center bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Continuer les achats
                </Link>
                <button
                  onClick={() => {
                    if (window.confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
                      clearCart();
                    }
                  }}
                  className="w-full py-2 text-center text-red-600 hover:text-red-800 font-medium transition-colors"
                >
                  Vider le panier
                </button>
              </div>

              {/* Security Badge */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Paiement sécurisé</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
