import Product from '../models/product.js';
import { cloudinary } from '../middlewares/upload.js';

// ── GET all products ──────────────────────────────────────────────
export const getProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, isActive } = req.query;

    const filter = {};

    if (category && category !== 'ALL') filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET single product ────────────────────────────────────────────
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── CREATE product ────────────────────────────────────────────────
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, variation, stock } = req.body;

    // Collect uploaded image URLs from Cloudinary (via multer-storage-cloudinary)
    const images = req.files ? req.files.map((f) => f.path) : [];

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category,
      variation,
      stock: Number(stock) || 0,
      images,
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── UPDATE product ────────────────────────────────────────────────
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const { name, description, price, category, variation, stock, isActive, removeImages } = req.body;

    // Handle image removals
    if (removeImages) {
      const toRemove = Array.isArray(removeImages) ? removeImages : [removeImages];
      for (const url of toRemove) {
        // Extract public_id from Cloudinary URL
        const parts = url.split('/');
        const publicId = `endurace/products/${parts[parts.length - 1].split('.')[0]}`;
        await cloudinary.uploader.destroy(publicId).catch(() => {});
      }
      product.images = product.images.filter((img) => !toRemove.includes(img));
    }

    // Add newly uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f) => f.path);
      product.images = [...product.images, ...newImages];
    }

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (category !== undefined) product.category = category;
    if (variation !== undefined) product.variation = variation;
    if (stock !== undefined) product.stock = Number(stock);
    if (isActive !== undefined) product.isActive = isActive === 'true' || isActive === true;

    await product.save();
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── DELETE product ────────────────────────────────────────────────
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Remove images from Cloudinary
    for (const url of product.images) {
      const parts = url.split('/');
      const publicId = `endurace/products/${parts[parts.length - 1].split('.')[0]}`;
      await cloudinary.uploader.destroy(publicId).catch(() => {});
    }

    await product.deleteOne();
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};