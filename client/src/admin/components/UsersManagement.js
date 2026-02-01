import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usersAPI } from '../../services/api';
import { FiEdit, FiTrash2, FiPlus, FiX, FiSave, FiAlertTriangle, FiCheckCircle, FiInfo } from 'react-icons/fi';

const ROLES = ['admin', 'manager', 'editor', 'viewer'];

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'viewer',
    permissions: {
      services: false,
      projects: false,
      products: false,
      orders: false,
      contacts: false,
      users: false,
    },
    isActive: true,
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, userId: null, username: null });
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState({ show: false, count: 0 });
  const [notification, setNotification] = useState({ show: false, message: '', type: 'error' });
  const deleteModalRef = useRef(null);
  const bulkDeleteModalRef = useRef(null);

  // Close modals when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (deleteModalRef.current && !deleteModalRef.current.contains(event.target)) {
        cancelDelete();
      }
      if (bulkDeleteModalRef.current && !bulkDeleteModalRef.current.contains(event.target)) {
        cancelBulkDelete();
      }
    };

    if (deleteConfirm.show || bulkDeleteConfirm.show) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [deleteConfirm.show, bulkDeleteConfirm.show]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotification('Erreur lors du chargement des utilisateurs', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const showNotification = (message, type = 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'error' });
    }, 4000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('permissions.')) {
      const permissionKey = name.split('.')[1];
      setFormData({
        ...formData,
        permissions: {
          ...formData.permissions,
          [permissionKey]: checked,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username || '',
        email: user.email || '',
        password: '',
        role: user.role || 'viewer',
        permissions: user.permissions || {
          services: false,
          projects: false,
          products: false,
          orders: false,
          contacts: false,
          users: false,
        },
        isActive: user.isActive !== undefined ? user.isActive : true,
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'viewer',
        permissions: {
          services: false,
          projects: false,
          products: false,
          orders: false,
          contacts: false,
          users: false,
        },
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'viewer',
      permissions: {
        services: false,
        projects: false,
        products: false,
        orders: false,
        contacts: false,
        users: false,
      },
      isActive: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        role: formData.role,
        permissions: formData.permissions,
        isActive: formData.isActive,
      };

      if (formData.password.trim()) {
        submitData.password = formData.password;
      }

      if (editingUser) {
        await usersAPI.update(editingUser._id, submitData);
        showNotification('Utilisateur mis à jour avec succès !', 'success');
      } else {
        if (!formData.password.trim()) {
          showNotification('Le mot de passe est requis pour créer un nouvel utilisateur', 'error');
          return;
        }
        await usersAPI.create(submitData);
        showNotification('Utilisateur créé avec succès !', 'success');
      }

      closeModal();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Échec de l\'enregistrement de l\'utilisateur. Veuillez réessayer.';
      showNotification(errorMessage, 'error');
    }
  };

  const handleDelete = (id, username) => {
    setDeleteConfirm({ show: true, userId: id, username: username });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.userId) {
      try {
        await usersAPI.delete(deleteConfirm.userId);
        fetchUsers();
        setDeleteConfirm({ show: false, userId: null, username: null });
        showNotification('Utilisateur supprimé avec succès !', 'success');
      } catch (error) {
        console.error('Error deleting user:', error);
        showNotification('Échec de la suppression de l\'utilisateur. Veuillez réessayer.', 'error');
        setDeleteConfirm({ show: false, userId: null, username: null });
      }
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, userId: null, username: null });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(users.map((u) => u._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkDelete = () => {
    if (selectedUsers.length === 0) return;
    setBulkDeleteConfirm({ show: true, count: selectedUsers.length });
  };

  const confirmBulkDelete = async () => {
    try {
      await usersAPI.bulkDelete(selectedUsers);
      setSelectedUsers([]);
      fetchUsers();
      setBulkDeleteConfirm({ show: false, count: 0 });
      showNotification(`${selectedUsers.length} utilisateur(s) supprimé(s) avec succès !`, 'success');
    } catch (error) {
      console.error('Error deleting users:', error);
      showNotification('Échec de la suppression de certains utilisateurs. Veuillez réessayer.', 'error');
      setBulkDeleteConfirm({ show: false, count: 0 });
    }
  };

  const cancelBulkDelete = () => {
    setBulkDeleteConfirm({ show: false, count: 0 });
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-purple-100 text-purple-800',
      editor: 'bg-blue-100 text-blue-800',
      viewer: 'bg-gray-100 text-gray-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const isAllSelected = users.length > 0 && selectedUsers.length === users.length;
  const isIndeterminate = selectedUsers.length > 0 && selectedUsers.length < users.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
        <div className="flex items-center space-x-3">
          {selectedUsers.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleBulkDelete}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-md"
            >
              <FiTrash2 className="mr-2" />
              Supprimer ({selectedUsers.length})
            </motion.button>
          )}
          <button
            onClick={() => openModal()}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all"
          >
            <FiPlus className="mr-2" />
            Ajouter un utilisateur
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    Aucun utilisateur trouvé. Ajoutez votre premier utilisateur !
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedUsers.includes(user._id) ? 'bg-primary-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleSelectUser(user._id)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(user.permissions || {}).map(([key, value]) =>
                          value ? (
                            <span
                              key={key}
                              className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded"
                            >
                              {key}
                            </span>
                          ) : null
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openModal(user)}
                          className="text-primary-600 hover:text-primary-900"
                          title="Modifier"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id, user.username)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Supprimer"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom d'utilisateur *
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mot de passe {!editingUser && '*'}
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required={!editingUser}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder={editingUser ? 'Laisser vide pour ne pas changer' : ''}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rôle *
                      </label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Permissions
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.keys(formData.permissions).map((key) => (
                        <label key={key} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            name={`permissions.${key}`}
                            checked={formData.permissions[key]}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700 capitalize">{key}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">Actif</label>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      <FiSave className="mr-2" />
                      {editingUser ? 'Mettre à jour' : 'Créer'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <motion.div
              ref={deleteModalRef}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
            >
              <div className="bg-red-50 px-6 py-4 border-b border-red-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-full">
                      <FiAlertTriangle className="text-red-600" size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Confirmation de suppression
                    </h3>
                  </div>
                  <button
                    onClick={cancelDelete}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              </div>

              <div className="px-6 py-6">
                <p className="text-gray-700 mb-2">
                  Êtes-vous sûr de vouloir supprimer cet utilisateur ?
                </p>
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-600 mb-1">Utilisateur:</p>
                  <p className="font-semibold text-gray-900">
                    {deleteConfirm.username}
                  </p>
                </div>
                <p className="text-sm text-red-600 font-medium">
                  ⚠️ Cette action est irréversible.
                </p>
              </div>

              <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
                <button
                  onClick={cancelDelete}
                  className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                >
                  <FiTrash2 size={18} />
                  Supprimer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk Delete Confirmation Modal */}
      <AnimatePresence>
        {bulkDeleteConfirm.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <motion.div
              ref={bulkDeleteModalRef}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
            >
              <div className="bg-red-50 px-6 py-4 border-b border-red-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-full">
                      <FiAlertTriangle className="text-red-600" size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Confirmation de suppression multiple
                    </h3>
                  </div>
                  <button
                    onClick={cancelBulkDelete}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              </div>

              <div className="px-6 py-6">
                <p className="text-gray-700 mb-2">
                  Êtes-vous sûr de vouloir supprimer {bulkDeleteConfirm.count} utilisateur(s) sélectionné(s) ?
                </p>
                <p className="text-sm text-red-600 font-medium">
                  ⚠️ Cette action est irréversible.
                </p>
              </div>

              <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
                <button
                  onClick={cancelBulkDelete}
                  className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmBulkDelete}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                >
                  <FiTrash2 size={18} />
                  Supprimer ({bulkDeleteConfirm.count})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-4 left-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl max-w-md w-full mx-4 ${
              notification.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : notification.type === 'info'
                ? 'bg-blue-50 border border-blue-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            {notification.type === 'success' ? (
              <FiCheckCircle className="text-green-600 flex-shrink-0" size={24} />
            ) : notification.type === 'info' ? (
              <FiInfo className="text-blue-600 flex-shrink-0" size={24} />
            ) : (
              <FiAlertTriangle className="text-red-600 flex-shrink-0" size={24} />
            )}
            <p
              className={`flex-1 font-medium ${
                notification.type === 'success'
                  ? 'text-green-800'
                  : notification.type === 'info'
                  ? 'text-blue-800'
                  : 'text-red-800'
              }`}
            >
              {notification.message}
            </p>
            <button
              onClick={() => setNotification({ show: false, message: '', type: 'error' })}
              className={`flex-shrink-0 ${
                notification.type === 'success'
                  ? 'text-green-600 hover:text-green-800'
                  : notification.type === 'info'
                  ? 'text-blue-600 hover:text-blue-800'
                  : 'text-red-600 hover:text-red-800'
              } transition-colors`}
            >
              <FiX size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UsersManagement;
