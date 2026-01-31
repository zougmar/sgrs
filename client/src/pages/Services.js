import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { servicesAPI } from '../services/api';
import { FiArrowRight } from 'react-icons/fi';
import { useTranslation, useLanguage } from '../context/LanguageContext';
import { getServiceImage } from '../utils/serviceImages';

const Services = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await servicesAPI.getAll();
        setServices(response.data.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <span className="ml-4 text-gray-600">{t('services.loading')}</span>
      </div>
    );
  }

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('services.title')}</h1>
            <p className="text-xl text-primary-100">
              {t('services.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {services.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">{t('services.noServices')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <motion.div
                  key={service._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100 cursor-pointer group"
                  onClick={() => navigate(`/services/${service._id}`)}
                >
                  <div className="mb-4 transform group-hover:scale-110 transition-transform flex items-center justify-center h-32">
                    {(() => {
                      const serviceImage = getServiceImage(service.title);
                      if (serviceImage) {
                        return (
                          <img
                            src={serviceImage}
                            alt={service.title}
                            className="h-full w-auto object-contain rounded-lg"
                          />
                        );
                      }
                      // Fallback to icon if no image mapping found
                      if (service.icon && service.icon.startsWith('fa-')) {
                        return <i className={`fa ${service.icon} text-primary`}></i>;
                      }
                      return <span className="text-5xl">{service.icon || '🔒'}</span>;
                    })()}
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{service.shortDescription}</p>
                  <div className={`text-primary-600 font-medium group-hover:text-primary-700 inline-flex items-center`}>
                    {t('services.learnMore')}
                    <FiArrowRight className={`${isRTL ? 'mr-1' : 'ml-1'} transform group-hover:translate-x-1 transition-transform`} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default Services;
