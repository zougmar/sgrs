import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiShield, FiLock, FiCamera, FiThermometer } from 'react-icons/fi';
import { servicesAPI, projectsAPI, productsAPI } from '../services/api';
import { useTranslation, useLanguage } from '../context/LanguageContext';
import { getServiceImage } from '../utils/serviceImages';

const Home = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [services, setServices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, projectsRes, productsRes] = await Promise.all([
          servicesAPI.getAll(),
          projectsAPI.getAll(),
          productsAPI.getAll().catch(() => ({ data: { data: [] } })), // Fallback if products API fails
        ]);
        setServices(servicesRes.data.data.slice(0, 6));
        setProjects(projectsRes.data.data.slice(0, 6));
        setProducts(productsRes.data.data.slice(0, 6));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {t('home.hero.title')}
              <span className="block text-primary-200">{t('home.hero.subtitle')}</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              {t('home.hero.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/contact"
                className={`inline-flex items-center justify-center px-8 py-4 bg-white text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition-all transform hover:scale-105`}
              >
                {t('home.hero.contact')}
                <FiArrowRight className={isRTL ? 'mr-2' : 'ml-2'} />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-500/20 backdrop-blur-sm text-white font-semibold rounded-lg border-2 border-white/30 hover:bg-primary-500/30 transition-all"
              >
                {t('home.hero.cta')}
              </Link>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Services Preview */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('home.services.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('home.services.subtitle')}
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {services.length > 0 ? (
                services.map((service, index) => (
                  <motion.div
                    key={service._id}
                    variants={itemVariants}
                    className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100"
                  >
                    <div className="mb-4 flex items-center justify-center h-24">
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
                        return <span className="text-4xl">{service.icon || '🔒'}</span>;
                      })()}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{service.shortDescription}</p>
                    <Link
                      to={`/services/${service._id}`}
                      className={`text-primary-600 font-medium hover:text-primary-700 inline-flex items-center`}
                    >
                      {t('home.services.learnMore')}
                      <FiArrowRight className={isRTL ? 'mr-1' : 'ml-1'} />
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500">
                  {t('services.noServices')}
                </div>
              )}
            </motion.div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/services"
              className={`inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all`}
            >
              {t('home.services.title')}
              <FiArrowRight className={isRTL ? 'mr-2' : 'ml-2'} />
            </Link>
          </div>
        </div>
      </section>

      {/* Products Preview */}
      {products.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t('home.products.title')}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('home.products.subtitle')}
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {products.map((product, index) => {
                const getCategoryColor = (category) => {
                  const colors = {
                    'Cameras': '#C1121F',
                    'Extincteurs': '#F77F00',
                    'Climatisation': '#FCA311',
                    'Alarms': '#C1121F',
                    'Access Control': '#F77F00',
                    'Solar Water Heaters': '#FCA311',
                  };
                  return colors[category] || '#1D1D1D';
                };

                return (
                  <motion.div
                    key={product._id || product.id}
                    variants={itemVariants}
                    className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all group cursor-pointer"
                    onClick={() => window.location.href = `/products/${product._id || product.id}`}
                  >
                    {/* Product Image */}
                    {product.image && (
                      <div className="relative h-48 bg-gray-100 overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        {/* Category Badge */}
                        <div
                          className="absolute top-3 right-3 px-3 py-1 rounded-full text-white text-xs font-semibold shadow-lg"
                          style={{ backgroundColor: getCategoryColor(product.category) }}
                        >
                          {product.category}
                        </div>
                      </div>
                    )}

                    {/* Product Info */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">
                        {product.shortDescription || product.description}
                      </p>
                      
                      {/* Price */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-[#C1121F]">
                          {product.price?.toLocaleString('fr-FR')} MAD
                        </span>
                        {product.stock !== undefined && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            product.stock > 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.stock > 0 ? 'En stock' : 'Rupture'}
                          </span>
                        )}
                      </div>

                      {/* View Product Button */}
                      <Link
                        to={`/products/${product._id || product.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="block w-full text-center px-4 py-2 bg-gradient-to-r from-[#C1121F] to-[#F77F00] text-white font-semibold rounded-lg hover:from-[#9a0e18] hover:to-[#c66600] transition-all"
                      >
                        {t('home.products.viewProduct')}
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            <div className="text-center mt-12">
              <Link
                to="/products"
                className={`inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#C1121F] to-[#F77F00] text-white font-semibold rounded-lg hover:from-[#9a0e18] hover:to-[#c66600] transition-all`}
              >
                {t('home.products.viewAll')}
                <FiArrowRight className={isRTL ? 'mr-2' : 'ml-2'} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {t('home.about.title')}
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                {t('home.about.description')}
              </p>
              <div className="space-y-4">
                {[
                  { icon: FiShield, text: 'Certified Professionals' },
                  { icon: FiLock, text: '24/7 Support & Monitoring' },
                  { icon: FiCamera, text: 'Latest Technology' },
                  { icon: FiThermometer, text: 'Complete Solutions' },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <item.icon className="text-primary-600" size={20} />
                    </div>
                    <span className="text-gray-700 font-medium">{item.text}</span>
                  </motion.div>
                ))}
              </div>
              <Link
                to="/about"
                className={`inline-flex items-center mt-8 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all`}
              >
                {t('home.about.readMore')}
                <FiArrowRight className={isRTL ? 'mr-2' : 'ml-2'} />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl shadow-2xl overflow-hidden">
                <img
                  src={require('../images/design.jpeg')}
                  alt="SGRS Services"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Projects Slider */}
      {projects.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t('home.projects.title')}
              </h2>
              <p className="text-lg text-gray-600">
                {t('home.projects.subtitle')}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.slice(0, 6).map((project, index) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  {project.images && project.images.length > 0 && project.images[0] ? (
                    <img
                      src={project.images[0]}
                      alt={project.title}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        console.error('Image failed to load:', project.images[0], e);
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-64 bg-gradient-to-br from-primary-400 to-primary-600"></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                      <p className="text-sm text-gray-200">{project.category}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/projects"
                className={`inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all`}
              >
                {t('home.projects.viewAll')}
                <FiArrowRight className={isRTL ? 'mr-2' : 'ml-2'} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Contact CTA */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('home.cta.title')}
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              {t('home.cta.description')}
            </p>
            <Link
              to="/contact"
              className={`inline-flex items-center px-8 py-4 bg-white text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition-all transform hover:scale-105`}
            >
              {t('home.cta.button')}
              <FiArrowRight className={isRTL ? 'mr-2' : 'ml-2'} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
