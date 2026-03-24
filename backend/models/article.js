import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema(
  {
    heading:   { type: String, default: '' },
    body:      { type: String, default: '' },
    images:    [{ type: String }],
    listItems: [{ type: String }],
  },
  { _id: false }
);

const articleSchema = new mongoose.Schema(
  {
    title:         { type: String, required: true, trim: true },
    subtitle:      { type: String, trim: true, default: '' },
    author:        { type: String, default: 'Admin' },
    readTime:      { type: String, default: '5 min read' },
    featuredImage: { type: String, default: '' },
    content: {
      intro:    { type: String, default: '' },
      sections: [sectionSchema],
    },
    isActive:    { type: Boolean, default: true },
    publishedAt: { type: Date,    default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Article', articleSchema);