const nodemailer = require('nodemailer');
const { generateInvoicePDF } = require('./pdfGenerator');

// Create transporter
const createTransporter = () => {
  // Check if email configuration exists
  const emailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD,
    },
  };

  // If no email credentials, return null (email sending will be skipped)
  if (!emailConfig.auth.user || !emailConfig.auth.pass) {
    console.warn('⚠️  Email configuration not found. Email sending will be skipped.');
    return null;
  }

  return nodemailer.createTransport(emailConfig);
};

// Send order confirmation email with PDF
const sendOrderConfirmationEmail = async (order) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('📧 Email not sent: Email configuration not available');
      return { success: false, message: 'Email configuration not available' };
    }

    // Generate PDF
    const pdfDoc = generateInvoicePDF(order);
    // Get PDF as buffer - jsPDF output method returns Uint8Array or string
    const pdfOutput = pdfDoc.output('arraybuffer');
    const pdfBuffer = Buffer.from(pdfOutput);

    // Email content
    const mailOptions = {
      from: `"SGRS" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: order.customer.email,
      subject: `Confirmation de commande - ${order.orderNumber || order._id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #C1121F 0%, #F77F00 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .order-info {
              background: white;
              padding: 20px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: #C1121F;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Merci pour votre commande !</h1>
            </div>
            <div class="content">
              <p>Bonjour <strong>${order.customer.fullName}</strong>,</p>
              
              <p>Nous vous remercions pour votre commande. Votre facture est jointe à cet email.</p>
              
              <div class="order-info">
                <h3>Détails de votre commande :</h3>
                <p><strong>Numéro de commande :</strong> ${order.orderNumber || order._id}</p>
                <p><strong>Date :</strong> ${new Date(order.createdAt).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
                <p><strong>Total :</strong> ${(order.total * 1.20).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD</p>
              </div>
              
              <p>Nous traiterons votre commande dans les plus brefs délais. Vous recevrez un email de confirmation une fois votre commande expédiée.</p>
              
              <p>Si vous avez des questions, n'hésitez pas à nous contacter :</p>
              <ul>
                <li>📞 Téléphone : +212 6 70 48 31 49</li>
                <li>✉️ Email : grouperachidsystem@gmail.com</li>
                <li>📍 Adresse : N°451 Hay Almassira, Ouarzazate, Morocco</li>
              </ul>
              
              <p>Cordialement,<br><strong>L'équipe SGRS</strong></p>
            </div>
            <div class="footer">
              <p>SGRS - Solutions de Sécurité Professionnelles</p>
              <p>N°451 Hay Almassira, Ouarzazate, Morocco</p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `Facture_${order.orderNumber || order._id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendOrderConfirmationEmail };
