import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { projectsAPI } from '../../services/api';
import { FiEdit, FiTrash2, FiPlus, FiX, FiSave, FiAlertTriangle, FiCheckCircle, FiInfo } from 'react-icons/fi';

const ProjectsManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Security Cameras',
    location: '',
    year: new Date().getFullYear(),
    isActive: true,
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, projectId: null, projectTitle: null });
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState({ show: false, count: 0 });
  const [notification, setNotification] = useState({ show: false, message: '', type: 'error' });
  const deleteModalRef = useRef(null);
  const bulkDeleteModalRef = useRef(null);

  const categories = [
    'Security Cameras',
    'Fire Protection',
    'Access Control',
    'Alarms',
    'Solar Water Heaters',
    'Air Conditioning',
    'Maintenance',
  ];

  useEffect(() => {
    fetchProjects();
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

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getAll();
      const projectsData = response.data.data;
      console.log('Admin - Fetched projects:', projectsData.length);
      projectsData.forEach((project, idx) => {
        console.log(`Admin - Project ${idx + 1}: ${project.title}`, {
          images: project.images,
          imagesLength: project.images?.length || 0,
          firstImage: project.images?.[0]
        });
      });
      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
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
    const files = Array.from(e.target.files);
    setImageFiles([...imageFiles, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const showNotification = (message, type = 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'error' });
    }, 4000);
  };

  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      // Validate URL
      try {
        new URL(newImageUrl.trim());
        setImageUrls([...imageUrls, newImageUrl.trim()]);
        setImagePreviews([...imagePreviews, newImageUrl.trim()]);
        setNewImageUrl('');
      } catch (error) {
        showNotification('Veuillez entrer une URL valide', 'error');
      }
    }
  };

  const removeImageUrl = (index) => {
    // Find the index in imagePreviews (accounting for file previews)
    const urlIndex = imagePreviews.findIndex((preview, idx) => {
      const fileCount = imageFiles.length;
      return idx >= fileCount && (idx - fileCount) === index;
    });
    
    if (urlIndex !== -1) {
      setImagePreviews(imagePreviews.filter((_, i) => i !== urlIndex));
    }
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
      };

      // Handle images: separate new files from URLs and existing URLs
      const newImageUrls = imageUrls.filter(url => {
        // Only include URLs that are not from existing project images
        if (editingProject && editingProject.images) {
          return !editingProject.images.includes(url);
        }
        return true;
      });

      if (imageFiles.length > 0 || newImageUrls.length > 0) {
        // New files or URLs uploaded
        submitData.images = imageFiles;
        submitData.imageUrls = newImageUrls; // Send URLs separately
      } else if (editingProject && editingProject.images && editingProject.images.length > 0) {
        // Keep existing images (URLs) - send as existingImages
        submitData.existingImages = editingProject.images;
        submitData.images = []; // Empty array for new files
        submitData.imageUrls = []; // Empty array for new URLs
      } else {
        // No images
        submitData.images = [];
        submitData.imageUrls = [];
      }

      console.log('Submitting project data:', {
        ...submitData,
        images: submitData.images.map(img => img instanceof File ? 'File' : img),
        existingImages: submitData.existingImages
      });

      let response;
      if (editingProject) {
        response = await projectsAPI.update(editingProject._id, submitData);
      } else {
        response = await projectsAPI.create(submitData);
      }

      console.log('Project saved successfully:', response.data);
      console.log('Project images:', response.data.data?.images);

      resetForm();
      fetchProjects();
      setShowModal(false);
      showNotification('Projet enregistré avec succès !', 'success');
    } catch (error) {
      console.error('Error saving project:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Échec de l\'enregistrement du projet. Veuillez réessayer.';
      showNotification(errorMessage, 'error');
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || '',
      description: project.description || '',
      category: project.category || 'Security Cameras',
      location: project.location || '',
      year: project.year || new Date().getFullYear(),
      isActive: project.isActive !== undefined ? project.isActive : true,
    });
    setImagePreviews(project.images || []);
    setImageFiles([]);
    // Extract URLs from existing images
    const existingUrls = (project.images || []).filter(img => typeof img === 'string' && !img.startsWith('blob:'));
    setImageUrls(existingUrls);
    setNewImageUrl('');
    setShowModal(true);
  };

  const handleDelete = (id, title) => {
    setDeleteConfirm({ show: true, projectId: id, projectTitle: title });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.projectId) {
      try {
        await projectsAPI.delete(deleteConfirm.projectId);
        fetchProjects();
        setSelectedProjects(selectedProjects.filter(projectId => projectId !== deleteConfirm.projectId));
        setDeleteConfirm({ show: false, projectId: null, projectTitle: null });
        showNotification('Projet supprimé avec succès !', 'success');
      } catch (error) {
        console.error('Error deleting project:', error);
        showNotification('Échec de la suppression du projet. Veuillez réessayer.', 'error');
        setDeleteConfirm({ show: false, projectId: null, projectTitle: null });
      }
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, projectId: null, projectTitle: null });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProjects(projects.map(project => project._id));
    } else {
      setSelectedProjects([]);
    }
  };

  const handleSelectProject = (projectId) => {
    setSelectedProjects(prev => 
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleBulkDelete = () => {
    if (selectedProjects.length === 0) return;
    setBulkDeleteConfirm({ show: true, count: selectedProjects.length });
  };

  const confirmBulkDelete = async () => {
    try {
      await Promise.all(selectedProjects.map(id => projectsAPI.delete(id)));
      setSelectedProjects([]);
      fetchProjects();
      setBulkDeleteConfirm({ show: false, count: 0 });
      showNotification(`${selectedProjects.length} projet(s) supprimé(s) avec succès !`, 'success');
    } catch (error) {
      console.error('Error deleting projects:', error);
      showNotification('Échec de la suppression de certains projets. Veuillez réessayer.', 'error');
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
      category: 'Security Cameras',
      location: '',
      year: new Date().getFullYear(),
      isActive: true,
    });
    setEditingProject(null);
    setImageFiles([]);
    setImagePreviews([]);
    setImageUrls([]);
    setNewImageUrl('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const isAllSelected = projects.length > 0 && selectedProjects.length === projects.length;
  const isIndeterminate = selectedProjects.length > 0 && selectedProjects.length < projects.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Projects Management</h1>
        <div className="flex items-center space-x-3">
          {selectedProjects.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleBulkDelete}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-md"
            >
              <FiTrash2 className="mr-2" />
              Delete Selected ({selectedProjects.length})
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
            Add Project
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
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year
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
              {projects.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No projects found. Add your first project!
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr 
                    key={project._id} 
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedProjects.includes(project._id) ? 'bg-primary-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedProjects.includes(project._id)}
                        onChange={() => handleSelectProject(project._id)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {project.images && project.images[0] ? (
                        <img
                          src={project.images[0]}
                          alt={project.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{project.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{project.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{project.location || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{project.year}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          project.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {project.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(project)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(project._id, project.title)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Supprimer le projet"
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
              className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingProject ? 'Edit Project' : 'Add New Project'}
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
                        Category *
                      </label>
                      <select
                        name="category"
                        required
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Year
                      </label>
                      <input
                        type="number"
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Images (Upload Files)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Images (Add URL)
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
                            addImageUrl();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={addImageUrl}
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
                      {editingProject ? 'Update' : 'Create'}
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
                  Êtes-vous sûr de vouloir supprimer ce projet ?
                </p>
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-600 mb-1">Projet:</p>
                  <p className="font-semibold text-gray-900">
                    {deleteConfirm.projectTitle}
                  </p>
                </div>
                <p className="text-sm text-red-600 font-medium">
                  ⚠️ Cette action est irréversible et supprimera définitivement le projet.
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
                  Êtes-vous sûr de vouloir supprimer {bulkDeleteConfirm.count} projet(s) sélectionné(s) ?
                </p>
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-600 mb-1">Nombre de projets:</p>
                  <p className="font-semibold text-gray-900 text-lg">
                    {bulkDeleteConfirm.count}
                  </p>
                </div>
                <p className="text-sm text-red-600 font-medium">
                  ⚠️ Cette action est irréversible et supprimera définitivement tous les projets sélectionnés.
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

      {/* Professional Notification Toast */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-4 left-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl max-w-md w-full mx-4 ${
              notification.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : notification.type === 'info'
                ? 'bg-blue-50 border border-blue-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            {notification.type === 'success' ? (
              <FiCheckCircle className="text-green-600 flex-shrink-0" size={24} />
            ) : notification.type === 'info' ? (
              <FiInfo className="text-blue-600 flex-shrink-0" size={24} />
            ) : (
              <FiAlertTriangle className="text-red-600 flex-shrink-0" size={24} />
            )}
            <p
              className={`flex-1 font-medium ${
                notification.type === 'success'
                  ? 'text-green-800'
                  : notification.type === 'info'
                  ? 'text-blue-800'
                  : 'text-red-800'
              }`}
            >
              {notification.message}
            </p>
            <button
              onClick={() => setNotification({ show: false, message: '', type: 'error' })}
              className={`flex-shrink-0 ${
                notification.type === 'success'
                  ? 'text-green-600 hover:text-green-800'
                  : notification.type === 'info'
                  ? 'text-blue-600 hover:text-blue-800'
                  : 'text-red-600 hover:text-red-800'
              } transition-colors`}
            >
              <FiX size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectsManagement;
