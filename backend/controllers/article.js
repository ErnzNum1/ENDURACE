import Article from '../models/article.js';

// ── Public: GET all active articles ──────────────────────────────
export const getArticles = async (req, res) => {
  try {
    const articles = await Article.find({ isActive: true })
      .select('title subtitle author readTime featuredImage publishedAt')
      .sort({ publishedAt: -1 });
    res.status(200).json({ success: true, articles });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// ── Public: GET single article ────────────────────────────────────
export const getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    res.status(200).json({ success: true, article });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// ── Admin: GET all articles ───────────────────────────────────────
export const getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find().sort({ publishedAt: -1 });
    res.status(200).json({ success: true, articles });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// ── Admin: Upload a single image (returns Cloudinary URL) ─────────
// Used for both featured image and section images from the mobile editor.
export const uploadSectionImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }
    res.status(200).json({ success: true, url: req.file.path });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// ── Admin: CREATE article ─────────────────────────────────────────
export const createArticle = async (req, res) => {
  try {
    // Body can be raw JSON or JSON-stringified in a `data` field (multipart)
    const body = typeof req.body.data === 'string'
      ? JSON.parse(req.body.data)
      : req.body;

    // If a featured image file was uploaded, override the featuredImage field
    if (req.file) body.featuredImage = req.file.path;

    const article = await Article.create(body);
    res.status(201).json({ success: true, article });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

// ── Admin: UPDATE article ─────────────────────────────────────────
export const updateArticle = async (req, res) => {
  try {
    const body = typeof req.body.data === 'string'
      ? JSON.parse(req.body.data)
      : req.body;

    if (req.file) body.featuredImage = req.file.path;

    const article = await Article.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true, runValidators: true }
    );
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    res.status(200).json({ success: true, article });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

// ── Admin: DELETE article ─────────────────────────────────────────
export const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    res.status(200).json({ success: true, message: 'Article deleted' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};