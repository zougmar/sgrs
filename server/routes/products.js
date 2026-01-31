const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { upload, uploadToCloudinary, isCloudinaryConfigured } = require('../middleware/upload');

// All routes are protected (admin only)
router.use(protect);

router
  .route('/')
  .get(getProducts)
  .post(upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 10 }
  ]), createProduct);

router
  .route('/bulk-delete')
  .post(bulkDeleteProducts);

router
  .route('/:id')
  .get(getProduct)
  .put(upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 10 }
  ]), updateProduct)
  .delete(deleteProduct);

module.exports = router;
