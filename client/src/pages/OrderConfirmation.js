import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiDownload, FiHome, FiShoppingBag } from 'react-icons/fi';
import { ordersAPI } from '../services/api';
import jsPDF from 'jspdf';
import logo2Image from '../images/logo2.jpeg';

const OrderConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await ordersAPI.getById(id);
        setOrder(response.data.data);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  const generatePDF = async () => {
    if (!order) return;

    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let y = 20;

    const primaryColor = [193, 18, 31]; // Red #C1121F
    const gray = [80, 80, 80];
    const lightGray = [240, 240, 240];
    const darkGray = [50, 50, 50];

    // Logo - Professional placement
    try {
      doc.addImage(logo2Image, "JPEG", margin, 10, 30, 30);
    } catch (error) {
      console.error('Error adding logo:', error);
    }

    // Company info - Professional layout with better spacing
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

    // Title - Right aligned, professional size
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text("DEVIS", pageWidth - margin, 25, { align: "right" });

    // Order info - Professional layout with divider
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

    // Divider line
    y += 8;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    // Client box - Professional styled box with accent header
    y += 5;
    const clientBoxHeight = 40;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(1);
    doc.rect(margin, y, pageWidth - (margin * 2), clientBoxHeight, "FD");
    
    // Header accent line
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

    // Table header - Professional style with red background
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

    // Table rows - Professional formatting with alternating backgrounds
    y += 12;
    doc.setTextColor(...darkGray);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    order.items.forEach((item, index) => {
      if (y > pageHeight - 80) {
        return; // Stop if running out of space
      }

      // Alternating row background for better readability
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

    // Totals section - Professional layout with prominent total box
    y += 10;
    const totalsStartX = 120;
    
    // Separator line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.8);
    doc.line(totalsStartX, y, pageWidth - margin, y);

    y += 8;
    const subtotal = order.total || 0;
    const tva = subtotal * 0.2;
    const totalFinal = subtotal + tva;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...darkGray);
    doc.text("Sous-total:", totalsStartX, y);
    doc.setFont('helvetica', 'bold');
    doc.text(`${subtotal.toFixed(2)} MAD`, pageWidth - margin, y, { align: "right" });

    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.text("TVA 20%:", totalsStartX, y);
    doc.setFont('helvetica', 'bold');
    doc.text(`${tva.toFixed(2)} MAD`, pageWidth - margin, y, { align: "right" });

    y += 8;
    // Separator line before total
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(1);
    doc.line(totalsStartX, y, pageWidth - margin, y);

    y += 10;
    // Total in prominent red box
    const totalBoxY = y - 6;
    const totalBoxHeight = 12;
    doc.setFillColor(...primaryColor);
    doc.rect(totalsStartX - 5, totalBoxY, pageWidth - totalsStartX - margin + 5, totalBoxHeight, "F");
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text("TOTAL:", totalsStartX, y);
    doc.setFontSize(14);
    doc.text(`${totalFinal.toFixed(2)} MAD`, pageWidth - margin, y, { align: "right" });

    // Footer - Professional layout with better organization
    y = 270;
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(1);
    doc.line(margin, y, pageWidth - margin, y);

    y += 10;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...gray);
    
    // Three columns layout for contact info
    const footerCol1 = margin;
    const footerCol2 = pageWidth / 2;
    const footerCol3 = pageWidth - margin;
    const footerColWidth = (pageWidth - margin * 2) / 3;
    
    // Column 1 - Email (left aligned)
    doc.text("Email:", footerCol1, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...darkGray);
    const emailLines = doc.splitTextToSize("grouperachidsystem@gmail.com", footerColWidth - 10);
    doc.text(emailLines, footerCol1, y + 4.5);
    
    // Column 2 - Phone (centered)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...gray);
    doc.text("Tel:", footerCol2 - 10, y, { align: "right" });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...darkGray);
    doc.text("+212 6 70 48 31 49", footerCol2 + 5, y);
    
    // Column 3 - Address (right aligned)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...gray);
    doc.text("Adresse:", footerCol3 - 5, y, { align: "right" });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...darkGray);
    const addressText = "N°451 Hay Almassira, Ouarzazate, Morocco";
    const addressLines = doc.splitTextToSize(addressText, footerColWidth - 10);
    doc.text(addressLines, footerCol3, y + 4.5, { align: "right" });

    // Thank you message
    y = 290;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text("Merci pour votre confiance", pageWidth / 2, y, { align: "center" });

    // Save PDF
    doc.save(`devis-${order.orderNumber || order._id}.pdf`);
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C1121F]"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Commande introuvable</p>
          <Link to="/products" className="text-[#C1121F] hover:underline">
            Retour aux produits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Success Message */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="mb-6"
            >
              <FiCheckCircle size={80} className="mx-auto text-green-500" />
            </motion.div>
            <h1 className="text-3xl font-bold text-[#1D1D1D] mb-4">
              Merci pour votre commande !
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              Votre commande a été reçue avec succès.
            </p>
            <p className="text-gray-500">
              Numéro de commande: <span className="font-semibold">{order.orderNumber || order._id}</span>
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-[#1D1D1D] mb-6">Détails de la commande</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Customer Info */}
              <div>
                <h3 className="text-lg font-semibold text-[#1D1D1D] mb-4">Informations client</h3>
                <div className="space-y-2 text-gray-600">
                  <p><span className="font-semibold">Nom:</span> {order.customer.fullName}</p>
                  <p><span className="font-semibold">Email:</span> {order.customer.email}</p>
                  <p><span className="font-semibold">Téléphone:</span> {order.customer.phone}</p>
                  <p><span className="font-semibold">Adresse:</span> {order.customer.address}</p>
                  <p><span className="font-semibold">Ville:</span> {order.customer.city}</p>
                  {order.customer.postalCode && (
                    <p><span className="font-semibold">Code postal:</span> {order.customer.postalCode}</p>
                  )}
                </div>
              </div>

              {/* Order Info */}
              <div>
                <h3 className="text-lg font-semibold text-[#1D1D1D] mb-4">Informations commande</h3>
                <div className="space-y-2 text-gray-600">
                  <p><span className="font-semibold">Date:</span> {new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
                  <p><span className="font-semibold">Statut:</span> 
                    <span className={`ml-2 px-3 py-1 rounded-full text-sm ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 className="text-lg font-semibold text-[#1D1D1D] mb-4">Articles commandés</h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#1D1D1D]">{item.name}</h4>
                      <p className="text-sm text-gray-600">Catégorie: {item.category}</p>
                      <p className="text-sm text-gray-600">
                        Quantité: {item.quantity} x {item.price.toLocaleString('fr-FR')} MAD
                      </p>
                    </div>
                    <p className="font-semibold text-[#C1121F]">
                      {(item.price * item.quantity).toLocaleString('fr-FR')} MAD
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center text-2xl font-bold">
                <span>Total:</span>
                <span className="text-[#C1121F]">
                  {order.total.toLocaleString('fr-FR')} MAD
                </span>
              </div>
            </div>

            {order.notes && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold text-[#1D1D1D] mb-2">Notes:</p>
                <p className="text-gray-600">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => generatePDF().catch(err => console.error('Error generating PDF:', err))}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#C1121F] text-white font-semibold rounded-lg hover:bg-[#9a0e18] transition-colors"
              >
                <FiDownload size={20} />
                Télécharger le devis (PDF)
              </motion.button>
              <Link
                to="/products"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                <FiShoppingBag size={20} />
                Continuer les achats
              </Link>
              <Link
                to="/"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                <FiHome size={20} />
                Retour à l'accueil
              </Link>
            </div>
          </div>

          {/* Thank You Message */}
          <div className="mt-8 bg-gradient-to-r from-[#C1121F] to-[#F77F00] rounded-xl shadow-lg p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Merci de nous avoir choisis !</h3>
            <p className="text-lg mb-2">
              Nous avons bien reçu votre commande et nous vous contacterons dans les plus brefs délais.
            </p>
            <p className="text-white/90">
              Pour toute question, n'hésitez pas à nous contacter.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
