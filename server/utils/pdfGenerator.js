const jsPDF = require('jspdf');
const fs = require('fs');
const path = require('path');

// Company Information
const companyInfo = {
  name: 'SGRS',
  tagline: 'Solutions de Sécurité Professionnelles',
  address: 'N°451 Hay Almassira, Ouarzazate, Morocco',
  phone: '+212 6 70 48 31 49',
  email: 'grouperachidsystem@gmail.com'
};

// Color scheme matching the invoice design
const colors = {
  background: [250, 248, 245], // Light beige
  red: [139, 0, 0], // Deep red
  text: [50, 50, 50], // Dark gray
  lightGray: [240, 240, 240]
};

// Load logo image as base64
const loadLogo = () => {
  try {
    const logoPath = path.join(__dirname, '../../client/public/logo1.jpeg');
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      return 'data:image/jpeg;base64,' + logoBuffer.toString('base64');
    }
    return null;
  } catch (error) {
    console.error('Error loading logo:', error);
    return null;
  }
};

const generateInvoicePDF = (order) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  const logoDataURL = loadLogo();

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
  
  // Main Title "FACTURE"
  doc.setFontSize(34);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.red);
  const titleX = logoDataURL ? margin + 70 : margin;
  doc.text('FACTURE', titleX, yPos + 35);
  
  yPos += 22;
  
  // Invoice number and date
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.text);
  doc.setFont('helvetica', 'bold');
  doc.text('N° de facture:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.red);
  doc.text(order.orderNumber || order._id.toString(), margin + 42, yPos);
  
  const orderDate = new Date(order.createdAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.text);
  doc.text('Date:', margin + 105, yPos);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.red);
  doc.text(orderDate, margin + 125, yPos);
  
  yPos += 20;
  
  // Company and Client Information - Two columns
  const leftCol = margin;
  const rightCol = pageWidth / 2 + 15;
  const colWidth = (pageWidth - margin * 2 - 30) / 2;
  const boxHeight = 50;
  
  // Left column - Company Information
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
  doc.text(companyInfo.name, leftCol + 5, companyY);
  companyY += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('📞', leftCol + 5, companyY);
  doc.text(companyInfo.phone, leftCol + 12, companyY);
  companyY += 6;
  doc.text('✉', leftCol + 5, companyY);
  doc.text(companyInfo.email, leftCol + 12, companyY);
  companyY += 6;
  doc.text('📍', leftCol + 5, companyY);
  const companyAddressLines = doc.splitTextToSize(companyInfo.address, colWidth - 15);
  doc.text(companyAddressLines, leftCol + 12, companyY);
  companyY += companyAddressLines.length * 5;
  
  // Right column - Client Information
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
  doc.text(order.customer.fullName, rightCol + 5, clientY);
  clientY += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('✉', rightCol + 5, clientY);
  doc.text(order.customer.email, rightCol + 12, clientY);
  clientY += 6;
  doc.text('📞', rightCol + 5, clientY);
  doc.text(order.customer.phone, rightCol + 12, clientY);
  clientY += 6;
  doc.text('📍', rightCol + 5, clientY);
  const clientAddressLines = doc.splitTextToSize(order.customer.address, colWidth - 15);
  doc.text(clientAddressLines, rightCol + 12, clientY);
  clientY += clientAddressLines.length * 5;
  if (order.customer.city) {
    clientY += 5;
    doc.text(order.customer.city, rightCol + 12, clientY);
    if (order.customer.postalCode) {
      clientY += 5;
      doc.text(order.customer.postalCode, rightCol + 12, clientY);
    }
  }
  
  yPos = Math.max(companyY, clientY) + 20;
  
  // Services/Items Table
  doc.setFillColor(...colors.red);
  doc.rect(margin, yPos - 6, contentWidth, 9, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  
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
  
  doc.text('DESCRIPTION', colPositions.description, yPos);
  doc.text('PRIX HT', colPositions.price, yPos, { align: 'right' });
  doc.text('TOTAL', colPositions.total, yPos, { align: 'right' });
  doc.text('QUANTITÉ', colPositions.qty, yPos, { align: 'center' });
  
  yPos += 7;
  doc.setTextColor(...colors.text);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  // Items rows
  order.items.forEach((item, index) => {
    if (yPos > pageHeight - 90) {
      return;
    }
    
    if (index % 2 === 0) {
      doc.setFillColor(...colors.lightGray);
      doc.rect(margin, yPos - 5, contentWidth, 10, 'F');
    }
    
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos + 4, pageWidth - margin, yPos + 4);
    
    const itemName = doc.splitTextToSize(item.name, colWidths.description - 8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.text);
    doc.text(itemName, colPositions.description, yPos);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.text);
    const priceText = `${item.price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD`;
    doc.text(priceText, colPositions.price, yPos, { align: 'right' });
    
    const subtotal = item.price * item.quantity;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.red);
    const totalText = `${subtotal.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD`;
    doc.text(totalText, colPositions.total, yPos, { align: 'right' });
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(...colors.red);
    const qtyX = colPositions.qty;
    const qtyY = yPos - 2;
    doc.circle(qtyX, qtyY, 8, 'F');
    doc.text(item.quantity.toString(), qtyX, qtyY + 1, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.text);
    
    yPos += Math.max(10, itemName.length * 4.5);
  });
  
  // Summary and Totals
  yPos += 18;
  const summaryX = pageWidth - margin - 130;
  const summaryWidth = 130;
  const boxPadding = 25;
  const summaryBoxHeight = 55;
  let summaryY = yPos;
  
  doc.setFillColor(255, 255, 255);
  doc.rect(summaryX - boxPadding, summaryY - 12, summaryWidth + (boxPadding * 2), summaryBoxHeight, 'F');
  
  doc.setDrawColor(160, 160, 160);
  doc.setLineWidth(5);
  doc.line(summaryX - boxPadding, summaryY - 12, summaryX - boxPadding, summaryY + summaryBoxHeight - 12);
  
  doc.setLineWidth(5);
  doc.line(pageWidth - margin - boxPadding, summaryY - 12, pageWidth - margin - boxPadding, summaryY + summaryBoxHeight - 12);
  
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(2.5);
  doc.line(summaryX - boxPadding, summaryY - 12, pageWidth - margin - boxPadding, summaryY - 12);
  
  doc.setLineWidth(2.5);
  doc.line(summaryX - boxPadding, summaryY + summaryBoxHeight - 12, pageWidth - margin - boxPadding, summaryY + summaryBoxHeight - 12);
  
  summaryY += 3;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.text);
  doc.text('SOUS TOTAL', summaryX, summaryY, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  const subtotalText = `${order.total.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD`;
  doc.text(subtotalText, pageWidth - margin - boxPadding, summaryY, { align: 'right' });
  
  summaryY += 11;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('TVA 20%', summaryX, summaryY, { align: 'right' });
  const tva = order.total * 0.20;
  doc.setFont('helvetica', 'bold');
  const tvaText = `${tva.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD`;
  doc.text(tvaText, pageWidth - margin - boxPadding, summaryY, { align: 'right' });
  
  summaryY += 13;
  
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(1.5);
  doc.line(summaryX - boxPadding, summaryY, pageWidth - margin - boxPadding, summaryY);
  
  summaryY += 11;
  const totalAmount = order.total + tva;
  
  const totalBoxHeight = 16;
  const totalBoxY = summaryY - 9;
  doc.setFillColor(...colors.red);
  doc.rect(summaryX - boxPadding, totalBoxY, summaryWidth + (boxPadding * 2), totalBoxHeight, 'F');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL', summaryX, summaryY, { align: 'right' });
  const finalTotalText = `${totalAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD`;
  doc.text(finalTotalText, pageWidth - margin - boxPadding, summaryY, { align: 'right' });
  
  yPos = summaryY + 25;
  
  // Footer section
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text('Mode de paiement: À convenir', margin, yPos);
  yPos += 6;
  
  const dueDate = new Date(order.createdAt);
  dueDate.setDate(dueDate.getDate() + 30);
  const dueDateStr = dueDate.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  doc.text(`Date d'échéance: ${dueDateStr}`, margin, yPos);
  yPos += 6;
  doc.text('Signature:', margin, yPos);
  
  // Thank you message at bottom center
  yPos = pageHeight - 20;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...colors.red);
  doc.text('Merci pour votre confiance', pageWidth / 2, yPos, { align: 'center' });
  
  return doc;
};

module.exports = { generateInvoicePDF };
