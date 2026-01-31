import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { servicesAPI, contactAPI } from '../services/api';
import { FiArrowLeft, FiCheck, FiMail, FiPhone, FiSend, FiShield, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useTranslation, useLanguage } from '../context/LanguageContext';
import { getServiceImage } from '../utils/serviceImages';

const ServiceDetail = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await servicesAPI.getById(id);
        setService(response.data.data);
        // Pre-fill form with service info
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: `${t('serviceDetail.contact.title')} - ${response.data.data.title}`,
          message: `${t('serviceDetail.contact.subtitle')} ${response.data.data.title}.`,
        });
      } catch (error) {
        console.error('Error fetching service:', error);
        navigate('/services');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchService();
    }
  }, [id, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    setFormSuccess(false);

    try {
      await contactAPI.create(formData);
      setFormSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: `${t('serviceDetail.contact.title')} - ${service.title}`,
        message: `${t('serviceDetail.contact.subtitle')} ${service.title}.`,
      });
      setTimeout(() => setFormSuccess(false), 5000);
    } catch (err) {
      setFormError(err.response?.data?.message || t('serviceDetail.contact.error'));
    } finally {
      setFormLoading(false);
    }
  };

  // Get the card image (the one displayed in service cards)
  const cardImage = service ? getServiceImage(service.title) : null;
  
  // Combine card image with service images, ensuring card image is first
  const allImages = service ? [
    cardImage, // Card image first
    service.image, // Then main service image
    ...(service.images || []) // Then additional gallery images
  ].filter(Boolean) : [];

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('services.noServices')}</h2>
          <Link
            to="/services"
            className={`inline-flex items-center text-primary-600 hover:text-primary-700`}
          >
            <FiArrowLeft className={isRTL ? 'ml-2' : 'mr-2'} />
            {t('serviceDetail.back')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <Link
              to="/services"
              className="inline-flex items-center text-primary-100 hover:text-white mb-6 transition-colors"
            >
              <FiArrowLeft className={isRTL ? 'ml-2' : 'mr-2'} />
              {t('serviceDetail.back')}
            </Link>
            <div className="flex items-start space-x-6">
              {cardImage ? (
                <div className="mb-4 flex-shrink-0">
                  <img
                    src={cardImage}
                    alt={service.title}
                    className="w-24 h-24 object-contain rounded-lg bg-white/10 p-2"
                  />
                </div>
              ) : (
                <div className="mb-4">
                  {service.icon && service.icon.startsWith('fa-') ? (
                    <i className={`fa ${service.icon} text-white`}></i>
                  ) : (
                    <span className="text-6xl">{service.icon || '🔒'}</span>
                  )}
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{service.title}</h1>
                <p className="text-xl text-primary-100">{service.shortDescription}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Service Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Gallery */}
              {allImages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                  {/* Main Image Display */}
                  <div className="relative group">
                    <img
                      src={allImages[selectedImageIndex]}
                      alt={service.title}
                      className="w-full h-96 object-cover cursor-pointer"
                      onClick={() => setShowImageModal(true)}
                    />
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                        >
                          <FiChevronLeft size={24} />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                        >
                          <FiChevronRight size={24} />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                          {selectedImageIndex + 1} / {allImages.length}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Gallery */}
                  {allImages.length > 1 && (
                    <div className="p-4 grid grid-cols-4 gap-2">
                      {allImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative overflow-hidden rounded-lg ${
                            selectedImageIndex === index ? 'ring-2 ring-primary-500' : ''
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${service.title} ${index + 1}`}
                            className="w-full h-20 object-cover hover:opacity-75 transition-opacity"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('serviceDetail.contact.title')}</h2>
                <div className="prose max-w-none text-gray-600 whitespace-pre-line leading-relaxed">
                  {service.description}
                </div>
              </motion.div>

              {/* Features */}
              {service.features && service.features.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl shadow-lg p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('serviceDetail.features')}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {service.features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                        className="flex items-start space-x-3"
                      >
                        <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mt-0.5">
                          <FiCheck className="text-primary-600" size={14} />
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Call to Action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl shadow-lg p-8 text-white"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <FiShield size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{t('about.cta.title')}</h3>
                    <p className="text-primary-100">{t('about.cta.description')}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="mt-4 px-6 py-3 bg-white text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition-all transform hover:scale-105"
                >
                  {t('about.cta.callButton')}
                </button>
              </motion.div>
            </div>

            {/* Sidebar - Contact Form */}
            <div className="lg:col-span-1" id="contact-form">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 p-8 sticky top-24"
              >
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mb-4 shadow-lg">
                    <FiMail className="text-white" size={28} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('serviceDetail.contact.title')}</h2>
                  <p className="text-sm text-gray-500">
                    {t('serviceDetail.contact.subtitle')}
                  </p>
                </div>

                {formSuccess && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FiCheck className="text-green-600" size={20} />
                      <span>{t('serviceDetail.contact.success')}</span>
                    </div>
                  </div>
                )}

                {formError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('serviceDetail.contact.name')} *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                      placeholder="Jean Dupont"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('serviceDetail.contact.email')} *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                      placeholder="jean@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('serviceDetail.contact.phone')} *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                      placeholder="+212 6 70 48 31 49"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('contact.form.subject')} *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('serviceDetail.contact.message')} *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows="5"
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none bg-white"
                      placeholder={t('serviceDetail.contact.subtitle')}
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    {formLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        {t('serviceDetail.contact.send')}
                        <FiSend className={`${isRTL ? 'mr-2' : 'ml-2'} transition-transform group-hover:translate-x-1`} />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t-2 border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Contact Direct</p>
                  <div className="space-y-3">
                    <a
                      href="tel:+212670483149"
                      className="flex items-center space-x-3 p-3 bg-gray-50 hover:bg-primary-50 rounded-lg transition-all group"
                    >
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                        <FiPhone className="text-primary-600" size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Téléphone</p>
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-700">+212 6 70 48 31 49</p>
                      </div>
                    </a>
                    <a
                      href="mailto:grouperachidsystem@gmail.com"
                      className="flex items-center space-x-3 p-3 bg-gray-50 hover:bg-primary-50 rounded-lg transition-all group"
                    >
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                        <FiMail className="text-primary-600" size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-700">grouperachidsystem@gmail.com</p>
                      </div>
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && allImages.length > 0 && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-6xl w-full"
            >
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full z-10"
              >
                <FiX size={24} />
              </button>
              <img
                src={allImages[selectedImageIndex]}
                alt={service.title}
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              />
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full"
                  >
                    <FiChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full"
                  >
                    <FiChevronRight size={24} />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full">
                    {selectedImageIndex + 1} / {allImages.length}
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServiceDetail;
