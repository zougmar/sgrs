import React from 'react';
import { FiShoppingCart } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartIcon = () => {
  const { getCartItemsCount } = useCart();
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/cart');
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      className="relative p-2 text-gray-700 hover:text-[#C1121F] transition-colors"
      title="Voir le panier"
    >
      <FiShoppingCart size={24} />
      {getCartItemsCount() > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 bg-[#C1121F] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
        >
          {getCartItemsCount()}
        </motion.span>
      )}
    </button>
  );
};

export default CartIcon;
