import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { contactAPI } from '../../services/api';
import { FiTrash2, FiMail, FiX, FiAlertTriangle, FiCheckCircle, FiInfo } from 'react-icons/fi';

const ContactsManagement = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [filter, setFilter] = useState('all'); // all, read, unread
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, contactId: null, contactName: null });
  const [notification, setNotification] = useState({ show: false, message: '', type: 'error' });
  const deleteModalRef = useRef(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (deleteModalRef.current && !deleteModalRef.current.contains(event.target)) {
        cancelDelete();
      }
    };

    if (deleteConfirm.show) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [deleteConfirm.show]);

  const fetchContacts = async () => {
    try {
      const response = await contactAPI.getAll();
      setContacts(response.data.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'error' });
    }, 4000);
  };

  const handleDelete = (id, name) => {
    setDeleteConfirm({ show: true, contactId: id, contactName: name });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.contactId) {
      try {
        await contactAPI.delete(deleteConfirm.contactId);
        fetchContacts();
        if (selectedContact && selectedContact._id === deleteConfirm.contactId) {
          setSelectedContact(null);
        }
        setDeleteConfirm({ show: false, contactId: null, contactName: null });
        showNotification('Message supprimé avec succès !', 'success');
      } catch (error) {
        console.error('Error deleting contact:', error);
        showNotification('Échec de la suppression du message. Veuillez réessayer.', 'error');
        setDeleteConfirm({ show: false, contactId: null, contactName: null });
      }
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, contactId: null, contactName: null });
  };

  const handleView = async (contact) => {
    try {
      const response = await contactAPI.getById(contact._id);
      setSelectedContact(response.data.data);
      fetchContacts(); // Refresh to update read status
      // Trigger a custom event to refresh notifications in parent
      window.dispatchEvent(new CustomEvent('messageRead'));
    } catch (error) {
      console.error('Error fetching contact:', error);
      setSelectedContact(contact);
    }
  };

  const filteredContacts =
    filter === 'all'
      ? contacts
      : filter === 'read'
      ? contacts.filter((c) => c.isRead)
      : contacts.filter((c) => !c.isRead);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({contacts.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'unread'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Unread ({contacts.filter((c) => !c.isRead).length})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'read'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Read ({contacts.filter((c) => c.isRead).length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {filteredContacts.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No messages found.
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <div
                    key={contact._id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedContact?._id === contact._id ? 'bg-primary-50' : ''
                    } ${!contact.isRead ? 'bg-blue-50' : ''}`}
                    onClick={() => handleView(contact)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                        <p className="text-sm text-gray-600">{contact.email}</p>
                      </div>
                      {!contact.isRead && (
                        <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">{contact.subject}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{contact.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedContact ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedContact.subject}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <FiMail className="mr-2" />
                      {selectedContact.email}
                    </span>
                    <span>{selectedContact.phone}</span>
                    <span>
                      {new Date(selectedContact.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDelete(selectedContact._id, selectedContact.name)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer le message"
                  >
                    <FiTrash2 size={20} />
                  </button>
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">From</h3>
                  <p className="text-gray-900">{selectedContact.name}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    {selectedContact.email}
                  </a>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Phone</h3>
                  <a
                    href={`tel:${selectedContact.phone}`}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    {selectedContact.phone}
                  </a>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Message</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {selectedContact.message}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <FiMail className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">Select a message to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Professional Delete Confirmation Modal */}
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
              {/* Header */}
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

              {/* Content */}
              <div className="px-6 py-6">
                <p className="text-gray-700 mb-2">
                  Êtes-vous sûr de vouloir supprimer ce message ?
                </p>
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-600 mb-1">Expéditeur:</p>
                  <p className="font-semibold text-gray-900">
                    {deleteConfirm.contactName}
                  </p>
                </div>
                <p className="text-sm text-red-600 font-medium">
                  ⚠️ Cette action est irréversible et supprimera définitivement le message.
                </p>
              </div>

              {/* Footer Actions */}
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

      {/* Professional Notification Toast */}
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

export default ContactsManagement;
