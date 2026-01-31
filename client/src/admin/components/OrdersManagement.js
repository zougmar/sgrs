import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEye, FiTrash2, FiMessageCircle, FiPhone, FiMail, FiAlertTriangle, FiX, FiDownload } from 'react-icons/fi';
import { ordersAPI } from '../../services/api';
import jsPDF from 'jspdf';
import logo2Image from '../../images/logo2.jpeg';

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, orderId: null, orderNumber: null });
  const deleteModalRef = useRef(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await ordersAPI.update(orderId, { status: newStatus });
      fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

  const handleDelete = (id, orderNumber) => {
    setDeleteConfirm({ show: true, orderId: id, orderNumber: orderNumber || id.slice(-8) });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.orderId) {
      try {
        await ordersAPI.delete(deleteConfirm.orderId);
        fetchOrders();
        if (selectedOrder && selectedOrder._id === deleteConfirm.orderId) {
          setSelectedOrder(null);
        }
        setDeleteConfirm({ show: false, orderId: null, orderNumber: null });
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Échec de la suppression de la commande. Veuillez réessayer.');
        setDeleteConfirm({ show: false, orderId: null, orderNumber: null });
      }
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, orderId: null, orderNumber: null });
  };

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

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredOrders = statusFilter === 'All' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  const handleWhatsApp = (phone) => {
    const message = encodeURIComponent('Bonjour, je vous contacte concernant ma commande.');
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  };

  const handleCall = (phone) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmail = (email) => {
    window.open(`mailto:${email}`, '_self');
  };

  const generatePDF = async (order) => {
    if (!order) return;

    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let y = 20;

    const primaryColor = [193, 18, 31];
    const gray = [80, 80, 80];
    const lightGray = [240, 240, 240];
    const darkGray = [50, 50, 50];

    try {
      doc.addImage(logo2Image, "JPEG", margin, 10, 30, 30);
    } catch (error) {
      console.error('Error adding logo:', error);
    }

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text("SGRS", 50, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...gray);
    doc.text("Solutions de Sécurité Professionnelles", 50, 26);
    doc.text("N°451 Hay Almassira, Ouarzazate, Morocco", 50, 32);
    doc.text("Tel: +212 6 70 48 31 49", 50, 38);
    doc.text("Email: grouperachidsystem@gmail.com", 50, 44);

    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text("DEVIS", pageWidth - margin, 25, { align: "right" });

    y = 60;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkGray);
    doc.text(`Devis N°:`, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...primaryColor);
    doc.text(order.orderNumber || order._id, margin + 25, y);
    
    const orderDate = new Date(order.createdAt).toLocaleDateString("fr-FR", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkGray);
    doc.text(`Date:`, pageWidth - margin - 30, y, { align: "right" });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...primaryColor);
    doc.text(orderDate, pageWidth - margin, y, { align: "right" });

    y += 8;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    y += 5;
    const clientBoxHeight = 40;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(1);
    doc.rect(margin, y, pageWidth - (margin * 2), clientBoxHeight, "FD");
    
    doc.setFillColor(...primaryColor);
    doc.rect(margin, y, pageWidth - (margin * 2), 3, "F");
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text("CLIENT", margin + 3, y + 8);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...darkGray);
    doc.text(`Nom: ${order.customer.fullName || 'N/A'}`, margin + 3, y + 15);
    
    if (order.customer.phone) {
      doc.text(`Tel: ${order.customer.phone}`, margin + 3, y + 21);
    }
    
    if (order.customer.email) {
      doc.text(`Email: ${order.customer.email}`, margin + 3, y + 27);
    }
    
    if (order.customer.address) {
      const addressLines = doc.splitTextToSize(`Adresse: ${order.customer.address}`, pageWidth - (margin * 2) - 6);
      doc.text(addressLines, margin + 3, y + 27 + (order.customer.email ? 6 : 0));
    }

    y += clientBoxHeight + 10;
    doc.setFillColor(...primaryColor);
    doc.rect(margin, y, pageWidth - (margin * 2), 10, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text("Description", margin + 3, y + 7);
    doc.text("Qté", 110, y + 7, { align: "center" });
    doc.text("Prix HT", 130, y + 7, { align: "right" });
    doc.text("Total", pageWidth - margin - 3, y + 7, { align: "right" });

    y += 12;
    doc.setTextColor(...darkGray);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    order.items.forEach((item, index) => {
      if (y > pageHeight - 80) {
        return;
      }

      if (index % 2 === 0) {
        doc.setFillColor(...lightGray);
        doc.rect(margin, y - 5, pageWidth - (margin * 2), 8, "F");
      }

      const total = (item.price || 0) * (item.quantity || 0);
      const itemName = doc.splitTextToSize(item.name || 'N/A', 85);

      doc.setTextColor(...darkGray);
      doc.text(itemName, margin + 3, y);
      doc.text(String(item.quantity || 0), 110, y, { align: "center" });
      doc.setFont('helvetica', 'bold');
      doc.text(`${(item.price || 0).toFixed(2)} MAD`, 130, y, { align: "right" });
      doc.setTextColor(...primaryColor);
      doc.text(`${total.toFixed(2)} MAD`, pageWidth - margin - 3, y, { align: "right" });
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...darkGray);

      y += Math.max(8, itemName.length * 4);
    });

    y += 10;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(120, y, pageWidth - margin, y);
    y += 8;

    const subtotal = order.total || 0;
    const tva = subtotal * 0.2;
    const totalFinal = subtotal + tva;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...darkGray);
    doc.text("Sous-total:", 120, y);
    doc.text(`${subtotal.toFixed(2)} MAD`, pageWidth - margin, y, { align: "right" });
    y += 7;

    doc.text("TVA 20%:", 120, y);
    doc.text(`${tva.toFixed(2)} MAD`, pageWidth - margin, y, { align: "right" });
    y += 7;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text("TOTAL:", 120, y);
    doc.text(`${totalFinal.toFixed(2)} MAD`, pageWidth - margin, y, { align: "right" });

    y = 270;
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    
    doc.text("Email:", margin, y + 8);
    doc.setFontSize(7.5);
    doc.text("grouperachidsystem@gmail.com", margin + 15, y + 8);
    
    doc.setFontSize(8);
    doc.text("Tel:", pageWidth / 2 - 15, y + 8, { align: "center" });
    doc.setFontSize(7.5);
    doc.text("+212 6 70 48 31 49", pageWidth / 2, y + 8, { align: "center" });
    
    doc.setFontSize(8);
    doc.text("Adresse:", pageWidth - margin - 50, y + 8, { align: "right" });
    doc.setFontSize(7.5);
    const addressText = doc.splitTextToSize("N°451 Hay Almassira, Ouarzazate, Morocco", 50);
    doc.text(addressText, pageWidth - margin, y + 8, { align: "right" });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text("Merci pour votre confiance", pageWidth / 2, 290, { align: "center" });

    doc.save(`devis-${order.orderNumber || order._id}.pdf`);
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Commandes</h1>
        <div className="flex items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="All">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmé</option>
            <option value="processing">En traitement</option>
            <option value="shipped">Expédié</option>
            <option value="completed">Terminé</option>
            <option value="cancelled">Annulé</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Numéro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        Aucune commande trouvée.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr
                        key={order._id}
                        className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                          selectedOrder && selectedOrder._id === order._id ? 'bg-primary-50' : ''
                        }`}
                        onClick={() => setSelectedOrder(order)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.orderNumber || order._id.slice(-8)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.customer.fullName}
                          </div>
                          <div className="text-sm text-gray-500">{order.customer.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-primary-600">
                            {order.total.toLocaleString('fr-FR')} MAD
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusColor(order.status)} focus:ring-2 focus:ring-primary-500`}
                          >
                            <option value="pending">En attente</option>
                            <option value="confirmed">Confirmé</option>
                            <option value="processing">En traitement</option>
                            <option value="shipped">Expédié</option>
                            <option value="completed">Terminé</option>
                            <option value="cancelled">Annulé</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(order);
                              }}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <FiEye size={18} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(order._id, order.orderNumber || order._id.slice(-8));
                              }}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Supprimer la commande"
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
        </div>

        {/* Order Details Sidebar */}
        {selectedOrder && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Détails de la commande</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Customer Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations client</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Nom complet</p>
                    <p className="text-gray-900">{selectedOrder.customer.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <p className="text-gray-900">{selectedOrder.customer.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Téléphone</p>
                    <p className="text-gray-900">{selectedOrder.customer.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Adresse</p>
                    <p className="text-gray-900">{selectedOrder.customer.address}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Ville</p>
                    <p className="text-gray-900">{selectedOrder.customer.city}</p>
                  </div>
                  {selectedOrder.customer.postalCode && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Code postal</p>
                      <p className="text-gray-900">{selectedOrder.customer.postalCode}</p>
                    </div>
                  )}
                </div>

                {/* Contact Actions */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleWhatsApp(selectedOrder.customer.phone)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    title="WhatsApp"
                  >
                    <FiMessageCircle size={18} />
                    WhatsApp
                  </button>
                  <button
                    onClick={() => handleCall(selectedOrder.customer.phone)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    title="Appeler"
                  >
                    <FiPhone size={18} />
                    Appeler
                  </button>
                  <button
                    onClick={() => handleEmail(selectedOrder.customer.email)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    title="Email"
                  >
                    <FiMail size={18} />
                    Email
                  </button>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Articles</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/64x64?text=No+Image';
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                        <p className="text-xs text-gray-600">Qté: {item.quantity}</p>
                        <p className="text-xs text-gray-600">
                          {item.price.toLocaleString('fr-FR')} MAD
                        </p>
                      </div>
                      <p className="font-semibold text-primary-600 text-sm">
                        {(item.price * item.quantity).toLocaleString('fr-FR')} MAD
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Sous-total:</span>
                  <span className="font-semibold">{selectedOrder.total.toLocaleString('fr-FR')} MAD</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary-600">
                    {selectedOrder.total.toLocaleString('fr-FR')} MAD
                  </span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                  <p className="text-sm text-gray-600">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Download PDF Button */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => generatePDF(selectedOrder)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  <FiDownload size={18} />
                  Télécharger le devis PDF
                </button>
              </div>
            </div>
          </div>
        )}
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
                  Êtes-vous sûr de vouloir supprimer cette commande ?
                </p>
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-600 mb-1">Numéro de commande:</p>
                  <p className="font-semibold text-gray-900">
                    {deleteConfirm.orderNumber}
                  </p>
                </div>
                <p className="text-sm text-red-600 font-medium">
                  ⚠️ Cette action est irréversible et supprimera définitivement la commande.
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
    </div>
  );
};

export default OrdersManagement;
