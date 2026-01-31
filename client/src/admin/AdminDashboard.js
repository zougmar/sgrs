import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome,
  FiShield,
  FiFolder,
  FiMail,
  FiShoppingBag,
  FiPackage,
  FiLogOut,
  FiMenu,
  FiX,
  FiBell,
  FiUsers,
} from 'react-icons/fi';
import Logo from '../components/Logo';
import ServicesManagement from './components/ServicesManagement';
import ProjectsManagement from './components/ProjectsManagement';
import ProductsManagement from './components/ProductsManagement';
import ContactsManagement from './components/ContactsManagement';
import OrdersManagement from './components/OrdersManagement';
import UsersManagement from './components/UsersManagement';
import DashboardHome from './components/DashboardHome';
import useMessageNotifications from './hooks/useMessageNotifications';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount, newMessages, clearNewMessages, refreshMessages } = useMessageNotifications(30000); // Check every 30 seconds
  const notificationRef = useRef(null);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin', icon: FiHome, label: 'Dashboard' },
    { path: '/admin/services', icon: FiShield, label: 'Services' },
    { path: '/admin/projects', icon: FiFolder, label: 'Projects' },
    { path: '/admin/products', icon: FiPackage, label: 'Products' },
    { path: '/admin/orders', icon: FiShoppingBag, label: 'Commandes' },
    { path: '/admin/contacts', icon: FiMail, label: 'Messages' },
    { path: '/admin/users', icon: FiUsers, label: 'Utilisateurs' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -250 }}
        animate={{ x: sidebarOpen ? 0 : -250 }}
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-white shadow-lg transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-0'
        } overflow-hidden`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Logo size="md" circular={true} />
                <div>
                  <h1 className="text-lg font-bold text-gray-900">SGRS</h1>
                  <p className="text-xs text-gray-500">Admin Panel</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const isMessages = item.path === '/admin/contacts';
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    if (isMessages) {
                      refreshMessages();
                    }
                  }}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors relative ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="relative">
                    <item.icon size={20} />
                    {isMessages && unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </motion.span>
                    )}
                  </div>
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 w-full text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <FiLogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <FiMenu size={24} />
          </button>
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (showNotifications) {
                    clearNewMessages();
                  }
                }}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiBell size={20} />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-xs text-gray-500">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    <div className="overflow-y-auto max-h-80">
                      {newMessages.length === 0 && unreadCount === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                          <FiMail className="mx-auto mb-2 text-gray-400" size={24} />
                          <p className="text-sm">No new messages</p>
                        </div>
                      ) : (
                        <>
                          {newMessages.length > 0 && (
                            <div className="p-2">
                              <p className="text-xs font-semibold text-gray-500 uppercase px-2 mb-2">
                                New Messages
                              </p>
                              {newMessages.map((message) => (
                                <Link
                                  key={message._id}
                                  to="/admin/contacts"
                                  onClick={() => {
                                    setShowNotifications(false);
                                    refreshMessages();
                                  }}
                                  className="block p-3 hover:bg-gray-50 rounded-lg transition-colors border-l-4 border-primary-500"
                                >
                                  <div className="flex items-start justify-between mb-1">
                                    <p className="font-semibold text-sm text-gray-900">
                                      {message.name}
                                    </p>
                                    <span className="text-xs text-gray-400">
                                      {new Date(message.createdAt).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                  </div>
                                  <p className="text-xs font-medium text-gray-700 mb-1">
                                    {message.subject}
                                  </p>
                                  <p className="text-xs text-gray-500 line-clamp-2">
                                    {message.message}
                                  </p>
                                </Link>
                              ))}
                            </div>
                          )}
                          {unreadCount > newMessages.length && (
                            <Link
                              to="/admin/contacts"
                              onClick={() => {
                                setShowNotifications(false);
                                refreshMessages();
                              }}
                              className="block p-4 text-center text-sm text-primary-600 hover:bg-primary-50 font-medium"
                            >
                              View all {unreadCount} unread messages
                            </Link>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <span className="text-sm text-gray-600">
              {JSON.parse(localStorage.getItem('user') || '{}').email}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/services" element={<ServicesManagement />} />
            <Route path="/projects" element={<ProjectsManagement />} />
            <Route path="/products" element={<ProductsManagement />} />
            <Route path="/orders" element={<OrdersManagement />} />
            <Route path="/contacts" element={<ContactsManagement />} />
            <Route path="/users" element={<UsersManagement />} />
          </Routes>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
