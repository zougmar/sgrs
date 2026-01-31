import React from 'react';
import jsPDF from 'jspdf';
import { FiDownload } from 'react-icons/fi';
import logo2Image from '../images/logo2.jpeg';

const InvoicePDF = ({
  companyInfo = {
    name: 'SGRS',
    tagline: 'Solutions de Sécurité Professionnelles',
    address: 'N°451 Hay Almassira, Ouarzazate, Morocco',
    phone: '+212 6 70 48 31 49',
    email: 'grouperachidsystem@gmail.com',
    logo: logo2Image
  },
  clientInfo = {
    name: '',
    phone: '',
    address: '',
    email: '',
    city: '',
    postalCode: ''
  },
  invoiceInfo = {
    invoiceNumber: '',
    date: new Date().toLocaleDateString('fr-FR'),
    type: 'devis' // 'devis' or 'invoice'
  },
  products = [],
  onDownload
}) => {
  // Calculate totals
  const calculateTotals = () => {
    const subtotalHT = products.reduce((sum, product) => {
      return sum + (product.unitPrice * product.quantity);
    }, 0);
    
    const tvaRate = 0.20; // 20%
    const tva = subtotalHT * tvaRate;
    const totalTTC = subtotalHT + tva;
    
    return {
      subtotalHT,
      tva,
      totalTTC
    };
  };

  const totals = calculateTotals();

  // Load logo image
  const loadLogo = (logoSource) => {
    return new Promise((resolve) => {
      if (!logoSource) {
        resolve(null);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      const tryLoad = (src) => {
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL('image/jpeg', 0.9);
            resolve(dataURL);
          } catch (error) {
            console.error('Error converting logo to base64:', error);
            resolve(null);
          }
        };
        
        img.onerror = () => {
          if (typeof src === 'string' && src.startsWith('/')) {
            img.src = src;
          } else {
            resolve(null);
          }
        };
        
        if (typeof src === 'string') {
          img.src = src;
        } else {
          try {
            img.src = src;
          } catch (error) {
            resolve(null);
          }
        }
      };
      
      tryLoad(logoSource);
    });
  };

  const generatePDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    // Company Information
    const company = {
      name: companyInfo.name,
      tagline: companyInfo.tagline,
      address: companyInfo.address,
      phone: companyInfo.phone,
      email: companyInfo.email
    };

    // Color scheme matching the invoice design
    const colors = {
      background: [250, 248, 245], // Light beige
      red: [139, 0, 0], // Deep red
      text: [50, 50, 50], // Dark gray
      lightGray: [240, 240, 240]
    };

    // Load logo image
    const logoDataURL = await loadLogo(companyInfo.logo);

    // Set background color (light beige)
    doc.setFillColor(...colors.background);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Decorative red star shapes in corners (simplified as circles)
    doc.setFillColor(...colors.red);
    doc.circle(pageWidth - 15, 15, 8, 'F');
    doc.circle(15, pageHeight - 15, 8, 'F');
    
    let yPos = 20;
    
    // Header section with logo prominently displayed
    if (logoDataURL) {
      try {
        // Logo with white circular background for professional look
        const logoSize = 60;
        const logoX = margin;
        const logoY = yPos;
        const logoRadius = logoSize / 2;
        
        // White circular background for logo
        doc.setFillColor(255, 255, 255);
        doc.circle(logoX + logoRadius, logoY + logoRadius, logoRadius + 3, 'F');
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(2);
        doc.circle(logoX + logoRadius, logoY + logoRadius, logoRadius + 3, 'S');
        
        // Add logo image
        const imagePadding = 4;
        doc.addImage(logoDataURL, 'JPEG', logoX + imagePadding, logoY + imagePadding, logoSize - (imagePadding * 2), logoSize - (imagePadding * 2));
      } catch (error) {
        console.error('Error adding logo to PDF:', error);
      }
    }
    
    // Main Title "DEVIS" or "FACTURE" - large elegant style
    const documentTitle = invoiceInfo.type === 'devis' ? 'DEVIS' : 'FACTURE';
    doc.setFontSize(34);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.red);
    const titleX = logoDataURL ? margin + 70 : margin;
    doc.text(documentTitle, titleX, yPos + 35);
    
    yPos += 22;
    
    // Invoice/Devis number and date - professional layout
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.text);
    doc.setFont('helvetica', 'bold');
    const documentNumberLabel = invoiceInfo.type === 'devis' ? 'N° de devis:' : 'N° de facture:';
    doc.text(documentNumberLabel, margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.red);
    doc.text(invoiceInfo.invoiceNumber || 'N/A', margin + 42, yPos);
    
    const invoiceDate = invoiceInfo.date || new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.text);
    doc.text('Date:', margin + 105, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.red);
    doc.text(invoiceDate, margin + 125, yPos);
    
    yPos += 20;
    
    // Company and Client Information - Two columns with professional boxes
    const leftCol = margin;
    const rightCol = pageWidth / 2 + 15;
    const colWidth = (pageWidth - margin * 2 - 30) / 2;
    const boxHeight = 50;
    
    // Left column - Company Information with styled box
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.rect(leftCol, yPos - 5, colWidth, boxHeight, 'FD');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.red);
    doc.text('★', leftCol + 5, yPos);
    doc.text('Votre entreprise', leftCol + 12, yPos);
    
    let companyY = yPos + 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.text);
    doc.text(company.name, leftCol + 5, companyY);
    companyY += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('📞', leftCol + 5, companyY);
    doc.text(company.phone, leftCol + 12, companyY);
    companyY += 6;
    doc.text('✉', leftCol + 5, companyY);
    doc.text(company.email, leftCol + 12, companyY);
    companyY += 6;
    doc.text('📍', leftCol + 5, companyY);
    const companyAddressLines = doc.splitTextToSize(company.address, colWidth - 15);
    doc.text(companyAddressLines, leftCol + 12, companyY);
    companyY += companyAddressLines.length * 5;
    
    // Right column - Client Information with styled box
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.rect(rightCol, yPos - 5, colWidth, boxHeight, 'FD');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.red);
    doc.text('★', rightCol + 5, yPos);
    doc.text('Client', rightCol + 12, yPos);
    
    let clientY = yPos + 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.text);
    doc.text(clientInfo.name || 'N/A', rightCol + 5, clientY);
    clientY += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    if (clientInfo.email) {
      doc.text('✉', rightCol + 5, clientY);
      doc.text(clientInfo.email, rightCol + 12, clientY);
      clientY += 6;
    }
    if (clientInfo.phone) {
      doc.text('📞', rightCol + 5, clientY);
      doc.text(clientInfo.phone, rightCol + 12, clientY);
      clientY += 6;
    }
    if (clientInfo.address) {
      doc.text('📍', rightCol + 5, clientY);
      const clientAddressLines = doc.splitTextToSize(clientInfo.address, colWidth - 15);
      doc.text(clientAddressLines, rightCol + 12, clientY);
      clientY += clientAddressLines.length * 5;
    }
    if (clientInfo.city) {
      clientY += 5;
      doc.text(clientInfo.city, rightCol + 12, clientY);
      if (clientInfo.postalCode) {
        clientY += 5;
        doc.text(clientInfo.postalCode, rightCol + 12, clientY);
      }
    }
    
    yPos = Math.max(companyY, clientY) + 20;
    
    // Products Table - Professional style with red header
    doc.setFillColor(...colors.red);
    doc.rect(margin, yPos - 6, contentWidth, 9, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    // Column widths optimized for professional layout
    const colWidths = {
      description: 95,
      price: 50,
      total: 50,
      qty: 30
    };
    const colPositions = {
      description: margin + 8,
      price: margin + colWidths.description + 10,
      total: margin + colWidths.description + colWidths.price + 12,
      qty: pageWidth - margin - colWidths.qty
    };
    
    // Table header
    doc.text('DESCRIPTION', colPositions.description, yPos);
    doc.text('PRIX HT', colPositions.price, yPos, { align: 'right' });
    doc.text('TOTAL', colPositions.total, yPos, { align: 'right' });
    doc.text('QUANTITÉ', colPositions.qty, yPos, { align: 'center' });
    
    yPos += 7;
    doc.setTextColor(...colors.text);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    // Items rows
    products.forEach((product, index) => {
      if (yPos > pageHeight - 90) {
        return;
      }
      
      // Light background for rows
      if (index % 2 === 0) {
        doc.setFillColor(...colors.lightGray);
        doc.rect(margin, yPos - 5, contentWidth, 10, 'F');
      }
      
      // Row border
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.3);
      doc.line(margin, yPos + 4, pageWidth - margin, yPos + 4);
      
      // Description
      const itemName = doc.splitTextToSize(product.name || 'N/A', colWidths.description - 8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.text);
      doc.text(itemName, colPositions.description, yPos);
      
      // Price HT
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.text);
      const priceText = `${(product.unitPrice || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD`;
      doc.text(priceText, colPositions.price, yPos, { align: 'right' });
      
      // Total
      const subtotal = (product.unitPrice || 0) * (product.quantity || 0);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.red);
      const totalText = `${subtotal.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD`;
      doc.text(totalText, colPositions.total, yPos, { align: 'right' });
      
      // Quantity - centered with background circle
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.setFillColor(...colors.red);
      const qtyX = colPositions.qty;
      const qtyY = yPos - 2;
      doc.circle(qtyX, qtyY, 8, 'F');
      doc.text((product.quantity || 0).toString(), qtyX, qtyY + 1, { align: 'center' });
      
      // Reset font and color
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.text);
      
      yPos += Math.max(10, itemName.length * 4.5);
    });
    
    // Summary and Totals - Right aligned with professional styling
    yPos += 18;
    const summaryX = pageWidth - margin - 130;
    const summaryWidth = 130;
    const boxPadding = 25;
    const summaryBoxHeight = 55;
    let summaryY = yPos;
    
    // Background box for summary section
    doc.setFillColor(255, 255, 255);
    doc.rect(summaryX - boxPadding, summaryY - 12, summaryWidth + (boxPadding * 2), summaryBoxHeight, 'F');
    
    // Draw left border (thick - 5px)
    doc.setDrawColor(160, 160, 160);
    doc.setLineWidth(5);
    doc.line(summaryX - boxPadding, summaryY - 12, summaryX - boxPadding, summaryY + summaryBoxHeight - 12);
    
    // Draw right border (thick - 5px)
    doc.setLineWidth(5);
    doc.line(pageWidth - margin - boxPadding, summaryY - 12, pageWidth - margin - boxPadding, summaryY + summaryBoxHeight - 12);
    
    // Draw top border (thicker - 2.5px)
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(2.5);
    doc.line(summaryX - boxPadding, summaryY - 12, pageWidth - margin - boxPadding, summaryY - 12);
    
    // Draw bottom border (thicker - 2.5px)
    doc.setLineWidth(2.5);
    doc.line(summaryX - boxPadding, summaryY + summaryBoxHeight - 12, pageWidth - margin - boxPadding, summaryY + summaryBoxHeight - 12);
    
    summaryY += 3;
    
    // Subtotal
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.text);
    doc.text('SOUS TOTAL', summaryX, summaryY, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    const subtotalText = `${totals.subtotalHT.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD`;
    doc.text(subtotalText, pageWidth - margin - boxPadding, summaryY, { align: 'right' });
    
    summaryY += 11;
    
    // TVA
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('TVA 20%', summaryX, summaryY, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    const tvaText = `${totals.tva.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD`;
    doc.text(tvaText, pageWidth - margin - boxPadding, summaryY, { align: 'right' });
    
    summaryY += 13;
    
    // Separator line
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(1.5);
    doc.line(summaryX - boxPadding, summaryY, pageWidth - margin - boxPadding, summaryY);
    
    summaryY += 11;
    
    // Total in prominent red box
    const totalBoxHeight = 16;
    const totalBoxY = summaryY - 9;
    doc.setFillColor(...colors.red);
    doc.rect(summaryX - boxPadding, totalBoxY, summaryWidth + (boxPadding * 2), totalBoxHeight, 'F');
    
    // White text for total
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    
    // TOTAL label
    doc.text('TOTAL', summaryX, summaryY, { align: 'right' });
    
    // Total amount
    doc.setFontSize(20);
    const totalText = `${totals.totalTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD`;
    doc.text(totalText, pageWidth - margin - boxPadding, summaryY, { align: 'right' });
    
    // Footer Section - Professional layout
    const footerY = pageHeight - 45;
    
    // Left side - Payment details with styled box
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.rect(margin, footerY - 8, pageWidth / 2 - margin - 10, 30, 'FD');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.red);
    doc.text('★', margin + 5, footerY);
    doc.text('Mode de paiement :', margin + 12, footerY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...colors.text);
    doc.text('À convenir', margin + 65, footerY);
    
    const footerY2 = footerY + 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...colors.red);
    doc.text('★', margin + 5, footerY2);
    doc.text('Date d\'échéance :', margin + 12, footerY2);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...colors.text);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30 days from now
    doc.text(dueDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' }), margin + 65, footerY2);
    
    // Right side - Signature with styled box
    const signatureX = pageWidth / 2 + 10;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.rect(signatureX, footerY - 8, pageWidth - signatureX - margin, 30, 'FD');
    
    doc.setFontSize(9);
    doc.setTextColor(...colors.text);
    doc.text('Signature suivie de la mention', signatureX + 5, footerY);
    doc.text('« Lu et approuvé, bon pour accord »', signatureX + 5, footerY + 7);
    
    // Signature line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(signatureX + 5, footerY + 15, signatureX + 80, footerY + 15);
    
    // Thank you message at bottom center
    const thankYouY = pageHeight - 12;
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.red);
    doc.text('Merci pour votre confiance', pageWidth / 2, thankYouY, { align: 'center' });
    
    // Save PDF
    const documentPrefix = invoiceInfo.type === 'devis' ? 'devis' : 'facture';
    const fileName = `${documentPrefix}_${invoiceInfo.invoiceNumber || Date.now()}.pdf`;
    doc.save(fileName);

    // Call callback if provided
    if (onDownload) {
      onDownload(fileName);
    }
  };

  const buttonText = invoiceInfo.type === 'devis' ? 'Télécharger le Devis PDF' : 'Télécharger la Facture PDF';

  return (
    <button
      onClick={generatePDF}
      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
    >
      <FiDownload size={18} />
      {buttonText}
    </button>
  );
};

export default InvoicePDF;
