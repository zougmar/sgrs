// Mapping of service titles to their corresponding images
import teleImage from '../images/tele.jpeg';
import warningImage from '../images/warning.png';
import designImage from '../images/design.jpeg';
import splitImage from '../images/Split.jpg';
import workrouteImage from '../images/workroute.jpeg';
import cheauffoImage from '../images/cheauffo.jpg';

export const serviceImageMap = {
  'Système d\'alarme et de télésurveillance': teleImage,
  'Protection et avertissement des incendie': warningImage,
  'Architecture Design': designImage,
  'Maintenance et installation de système de climatisation': splitImage,
  'Fix et Support': workrouteImage,
  'Maintenance et installation de système de chauffe-eau solaire': cheauffoImage,
};

// Function to get service image by title (case-insensitive and handles variations)
export const getServiceImage = (serviceTitle) => {
  if (!serviceTitle) return null;
  
  // Exact match first
  if (serviceImageMap[serviceTitle]) {
    return serviceImageMap[serviceTitle];
  }
  
  // Try case-insensitive match
  const normalizedTitle = serviceTitle.trim();
  for (const [key, value] of Object.entries(serviceImageMap)) {
    if (key.toLowerCase() === normalizedTitle.toLowerCase()) {
      return value;
    }
  }
  
  // Try partial match for common variations
  const lowerTitle = normalizedTitle.toLowerCase();
  if (lowerTitle.includes('alarme') || lowerTitle.includes('télésurveillance')) {
    return teleImage;
  }
  if (lowerTitle.includes('incendie') || lowerTitle.includes('fire')) {
    return warningImage;
  }
  if (lowerTitle.includes('architecture') || lowerTitle.includes('design')) {
    return designImage;
  }
  if (lowerTitle.includes('climatisation') || lowerTitle.includes('air conditioning')) {
    return splitImage;
  }
  if (lowerTitle.includes('fix') || lowerTitle.includes('support')) {
    return workrouteImage;
  }
  if (lowerTitle.includes('chauffe-eau') || lowerTitle.includes('solaire')) {
    return cheauffoImage;
  }
  
  return null;
};
