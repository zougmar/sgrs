import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { servicesAPI } from '../../services/api';
import { FiEdit, FiTrash2, FiPlus, FiX, FiSave, FiAlertTriangle } from 'react-icons/fi';

// Predefined services list
const PREDEFINED_SERVICES = [
  {
    title: 'Système d\'alarme et de télésurveillance',
    shortDescription: 'Solutions complètes de sécurité avec alarmes et surveillance à distance',
    description: 'Systèmes d\'alarme et de télésurveillance professionnels pour protéger votre propriété. Surveillance 24/7, détection d\'intrusion, alertes en temps réel et contrôle à distance via application mobile.',
    icon: 'fa-3x fa-shield-alt',
    defaultFeatures: [
      'Détection d\'intrusion',
      'Surveillance 24/7',
      'Alertes en temps réel',
      'Contrôle à distance',
      'Application mobile',
      'Installation professionnelle'
    ],
  },
  {
    title: 'Protection et avertissement des incendie',
    shortDescription: 'Systèmes de détection et d\'extinction d\'incendie complets',
    description: 'Systèmes de protection contre les incendies incluant détecteurs de fumée, alarmes incendie, systèmes d\'extinction automatique et équipements de sécurité. Conformité aux normes de sécurité.',
    icon: 'fa-3x fa-fire',
    defaultFeatures: [
      'Détecteurs de fumée',
      'Alarmes incendie',
      'Extinction automatique',
      'Conformité aux normes',
      'Inspection régulière',
      'Maintenance préventive'
    ],
  },
  {
    title: 'Architecture Design',
    shortDescription: 'Conception et design architectural pour vos projets',
    description: 'Services de conception architecturale et de design pour vos projets de construction et rénovation. Plans détaillés, visualisations 3D, et accompagnement tout au long du projet.',
    icon: 'fa-3x fa-building',
    defaultFeatures: [
      'Conception architecturale',
      'Plans détaillés',
      'Visualisations 3D',
      'Conseil en design',
      'Suivi de projet',
      'Rénovation et modernisation'
    ],
  },
  {
    title: 'Maintenance et installation de système de climatisation',
    shortDescription: 'Installation et maintenance de systèmes de climatisation',
    description: 'Services complets pour systèmes de climatisation : installation, réparation, maintenance préventive et dépannage d\'urgence. Solutions pour résidentiel et commercial.',
    icon: 'fa-3x fa-snowflake',
    defaultFeatures: [
      'Installation professionnelle',
      'Maintenance préventive',
      'Réparation et dépannage',
      'Nettoyage et entretien',
      'Service d\'urgence 24/7',
      'Optimisation énergétique'
    ],
  },
  {
    title: 'Fix et Support',
    shortDescription: 'Support technique et réparation pour tous vos systèmes',
    description: 'Service de support technique et de réparation pour tous vos équipements de sécurité et climatisation. Intervention rapide, diagnostic précis et solutions durables.',
    icon: 'fa-3x fa-tools',
    defaultFeatures: [
      'Support technique',
      'Réparation rapide',
      'Diagnostic précis',
      'Intervention d\'urgence',
      'Pièces de rechange',
      'Garantie sur réparations'
    ],
  },
  {
    title: 'Maintenance et installation de système de chauffe-eau solaire',
    shortDescription: 'Installation et maintenance de chauffe-eau solaires',
    description: 'Installation et maintenance de systèmes de chauffe-eau solaires écologiques. Réduction des coûts énergétiques, solutions durables et respectueuses de l\'environnement.',
    icon: 'fa-3x fa-sun',
    defaultFeatures: [
      'Installation solaire',
      'Économie d\'énergie',
      'Écologique et durable',
      'Maintenance régulière',
      'Optimisation des performances',
      'Conseil en énergie renouvelable'
    ],
  },
];

const ServicesManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    icon: '🔒',
    features: [],
    order: 0,
    isActive: true,
  });
  const [newFeature, setNewFeature] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [selectedPredefinedService, setSelectedPredefinedService] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, serviceId: null, serviceTitle: null });
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState({ show: false, count: 0 });
  const deleteModalRef = useRef(null);
  const bulkDeleteModalRef = useRef(null);

  useEffect(() => {
    fetchServices();
  }, []);

  // Close modals when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (deleteModalRef.current && !deleteModalRef.current.contains(event.target)) {
        cancelDelete();
      }
      if (bulkDeleteModalRef.current && !bulkDeleteModalRef.current.contains(event.target)) {
        cancelBulkDelete();
      }
    };

    if (deleteConfirm.show || bulkDeleteConfirm.show) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [deleteConfirm.show, bulkDeleteConfirm.show]);

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleMultipleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles([...imageFiles, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const addMainImageUrl = () => {
    if (imageUrl.trim()) {
      try {
        new URL(imageUrl.trim());
        setImagePreview(imageUrl.trim());
        setImageUrl('');
      } catch (error) {
        alert('Please enter a valid URL');
      }
    }
  };

  const addGalleryImageUrl = () => {
    if (newImageUrl.trim()) {
      try {
        new URL(newImageUrl.trim());
        setImageUrls([...imageUrls, newImageUrl.trim()]);
        setImagePreviews([...imagePreviews, newImageUrl.trim()]);
        setNewImageUrl('');
      } catch (error) {
        alert('Please enter a valid URL');
      }
    }
  };

  const removeImageUrl = (index) => {
    const urlIndex = imagePreviews.findIndex((preview, idx) => {
      const fileCount = imageFiles.length;
      return idx >= fileCount && (idx - fileCount) === index;
    });
    
    if (urlIndex !== -1) {
      setImagePreviews(imagePreviews.filter((_, i) => i !== urlIndex));
    }
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handlePredefinedServiceChange = (e) => {
    const serviceName = e.target.value;
    setSelectedPredefinedService(serviceName);
    
    if (serviceName) {
      const predefined = PREDEFINED_SERVICES.find(s => s.title === serviceName);
      if (predefined) {
        setFormData({
          ...formData,
          title: predefined.title,
          shortDescription: predefined.shortDescription,
          description: predefined.description,
          icon: predefined.icon,
          features: [...predefined.defaultFeatures],
        });
      }
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      });
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare submit data with all form fields
      const submitData = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription,
        icon: formData.icon,
        features: formData.features || [],
        order: Number(formData.order) || 0,
        isActive: formData.isActive !== undefined ? formData.isActive : true,
      };

      // Handle main image
      if (imageFile) {
        // New file uploaded
        submitData.image = imageFile;
      } else if (imagePreview && typeof imagePreview === 'string' && !imagePreview.startsWith('blob:')) {
        // New URL added
        submitData.imageUrl = imagePreview;
      } else if (editingService && editingService.image) {
        // Keep existing image URL
        submitData.image = editingService.image;
      }
      // If no image, don't include image field (will be null/undefined)

      // Handle gallery images
      // Separate existing image URLs from blob URLs (new uploads)
      const existingImageUrls = imagePreviews.filter(img => 
        typeof img === 'string' && !img.startsWith('blob:')
      );
      
      // Filter out URLs that are already in the service
      const newImageUrls = existingImageUrls.filter(url => {
        if (editingService && editingService.images) {
          return !editingService.images.includes(url);
        }
        return true;
      });
      
      if (imageFiles.length > 0 || newImageUrls.length > 0) {
        // New files or URLs uploaded
        submitData.images = imageFiles;
        submitData.imageUrls = newImageUrls;
      } else if (editingService && editingService.images && editingService.images.length > 0) {
        // Keep existing images (URLs) - use from service if no new uploads
        submitData.images = editingService.images;
        submitData.imageUrls = [];
      } else if (existingImageUrls.length > 0) {
        // Use existing URLs from previews (for newly added services)
        submitData.images = [];
        submitData.imageUrls = existingImageUrls;
      } else {
        // No images
        submitData.images = [];
        submitData.imageUrls = [];
      }

      console.log('Submitting service data:', { 
        ...submitData, 
        image: submitData.image instanceof File ? 'File' : submitData.image,
        images: submitData.images.map(img => img instanceof File ? 'File' : img)
      });

      if (editingService) {
        await servicesAPI.update(editingService._id, submitData);
      } else {
        await servicesAPI.create(submitData);
      }

      resetForm();
      fetchServices();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving service:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save service. Please try again.';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      title: service.title || '',
      description: service.description || '',
      shortDescription: service.shortDescription || '',
      icon: service.icon || 'fa-3x fa-lock',
      features: service.features || [],
      order: service.order || 0,
      isActive: service.isActive !== undefined ? service.isActive : true,
    });
    setImagePreview(service.image || null);
    setImageFile(null);
    setImageUrl('');
    setImagePreviews(service.images || []);
    setImageFiles([]);
    // Extract URLs from existing images
    const existingUrls = (service.images || []).filter(img => typeof img === 'string' && !img.startsWith('blob:'));
    setImageUrls(existingUrls);
    setNewImageUrl('');
    setSelectedPredefinedService('');
    setShowModal(true);
  };

  const handleDelete = (id, title) => {
    setDeleteConfirm({ show: true, serviceId: id, serviceTitle: title });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.serviceId) {
      try {
        await servicesAPI.delete(deleteConfirm.serviceId);
        fetchServices();
        setSelectedServices(selectedServices.filter(serviceId => serviceId !== deleteConfirm.serviceId));
        setDeleteConfirm({ show: false, serviceId: null, serviceTitle: null });
      } catch (error) {
        console.error('Error deleting service:', error);
        alert('Échec de la suppression du service. Veuillez réessayer.');
        setDeleteConfirm({ show: false, serviceId: null, serviceTitle: null });
      }
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, serviceId: null, serviceTitle: null });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedServices(services.map(service => service._id));
    } else {
      setSelectedServices([]);
    }
  };

  const handleSelectService = (serviceId) => {
    setSelectedServices(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleBulkDelete = () => {
    if (selectedServices.length === 0) return;
    setBulkDeleteConfirm({ show: true, count: selectedServices.length });
  };

  const confirmBulkDelete = async () => {
    try {
      await Promise.all(selectedServices.map(id => servicesAPI.delete(id)));
      setSelectedServices([]);
      fetchServices();
      setBulkDeleteConfirm({ show: false, count: 0 });
    } catch (error) {
      console.error('Error deleting services:', error);
      alert('Échec de la suppression de certains services. Veuillez réessayer.');
      setBulkDeleteConfirm({ show: false, count: 0 });
    }
  };

  const cancelBulkDelete = () => {
    setBulkDeleteConfirm({ show: false, count: 0 });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      shortDescription: '',
      icon: 'fa-3x fa-lock',
      features: [],
      order: 0,
      isActive: true,
    });
    setEditingService(null);
    setImageFile(null);
    setImagePreview(null);
    setImageUrl('');
    setImageFiles([]);
    setImagePreviews([]);
    setImageUrls([]);
    setNewImageUrl('');
    setSelectedPredefinedService('');
    setNewFeature('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const isAllSelected = services.length > 0 && selectedServices.length === services.length;
  const isIndeterminate = selectedServices.length > 0 && selectedServices.length < services.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Services Management</h1>
        <div className="flex items-center space-x-3">
          {selectedServices.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleBulkDelete}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-md"
            >
              <FiTrash2 className="mr-2" />
              Delete Selected ({selectedServices.length})
            </motion.button>
          )}
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all"
          >
            <FiPlus className="mr-2" />
            Add Service
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Short Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No services found. Add your first service!
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr 
                    key={service._id} 
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedServices.includes(service._id) ? 'bg-primary-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service._id)}
                        onChange={() => handleSelectService(service._id)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {service.image && (
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-16 h-16 object-cover rounded-lg shadow-sm"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{service.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-md truncate">
                        {service.shortDescription}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {service.order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          service.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(service._id, service.title)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Supprimer le service"
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

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowModal(false);
              resetForm();
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingService ? 'Edit Service' : 'Add New Service'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!editingService && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Choose Predefined Service (Optional)
                      </label>
                      <select
                        value={selectedPredefinedService}
                        onChange={handlePredefinedServiceChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">-- Select a service --</option>
                        {PREDEFINED_SERVICES.map((service, index) => (
                          <option key={index} value={service.title}>
                            {service.title}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Selecting a service will auto-fill the form. You can still edit the fields.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Short Description *
                    </label>
                    <input
                      type="text"
                      name="shortDescription"
                      required
                      value={formData.shortDescription}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      required
                      rows="4"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Icon
                      </label>
                      <div>
                        <input
                          type="text"
                          name="icon"
                          value={formData.icon}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-2"
                          placeholder="fa-3x fa-home"
                        />
                        <p className="text-xs text-gray-500 mb-2">
                          Use Font Awesome classes (e.g., fa-3x fa-home, fa-2x fa-shield-alt)
                        </p>
                        {formData.icon && formData.icon.startsWith('fa-') && (
                          <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                            <i className={`fa ${formData.icon} text-primary`}></i>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Order
                      </label>
                      <input
                        type="number"
                        name="order"
                        value={formData.order}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Main Image (Upload File)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Main Image (Add URL)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addMainImageUrl();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={addMainImageUrl}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        Add URL
                      </button>
                    </div>
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mt-2 w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gallery Images (Upload Files)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleMultipleImagesChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gallery Images (Add URL)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addGalleryImageUrl();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={addGalleryImageUrl}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        Add URL
                      </button>
                    </div>
                    {imagePreviews.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-4">
                        {imagePreviews.map((preview, index) => {
                          const isUrl = typeof preview === 'string' && !preview.startsWith('blob:');
                          const urlIndex = isUrl ? imageUrls.findIndex(url => url === preview) : -1;
                          return (
                            <div key={index} className="relative">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (isUrl && urlIndex !== -1) {
                                    removeImageUrl(urlIndex);
                                  } else {
                                    removeImage(index);
                                  }
                                }}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <FiX size={16} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Features
                    </label>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addFeature();
                          }
                        }}
                        placeholder="Add a feature"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={addFeature}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.features.map((feature, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                        >
                          {feature}
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="ml-2 text-primary-700 hover:text-primary-900"
                          >
                            <FiX size={16} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">Active</label>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      <FiSave className="mr-2" />
                      {editingService ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                  Êtes-vous sûr de vouloir supprimer ce service ?
                </p>
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-600 mb-1">Service:</p>
                  <p className="font-semibold text-gray-900">
                    {deleteConfirm.serviceTitle}
                  </p>
                </div>
                <p className="text-sm text-red-600 font-medium">
                  ⚠️ Cette action est irréversible et supprimera définitivement le service.
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

      {/* Professional Bulk Delete Confirmation Modal */}
      <AnimatePresence>
        {bulkDeleteConfirm.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <motion.div
              ref={bulkDeleteModalRef}
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
                      Confirmation de suppression multiple
                    </h3>
                  </div>
                  <button
                    onClick={cancelBulkDelete}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                <p className="text-gray-700 mb-2">
                  Êtes-vous sûr de vouloir supprimer {bulkDeleteConfirm.count} service(s) sélectionné(s) ?
                </p>
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-600 mb-1">Nombre de services:</p>
                  <p className="font-semibold text-gray-900 text-lg">
                    {bulkDeleteConfirm.count}
                  </p>
                </div>
                <p className="text-sm text-red-600 font-medium">
                  ⚠️ Cette action est irréversible et supprimera définitivement tous les services sélectionnés.
                </p>
              </div>

              {/* Footer Actions */}
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
                <button
                  onClick={cancelBulkDelete}
                  className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmBulkDelete}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                >
                  <FiTrash2 size={18} />
                  Supprimer ({bulkDeleteConfirm.count})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServicesManagement;
