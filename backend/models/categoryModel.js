import mongoose from 'mongoose';
import slugGenerator from 'mongoose-slug-generator';

mongoose.plugin(slugGenerator);

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, slug: 'name', unique: true, slugPaddingSize: 2 },
  },
  {
    timestamps: true,
  }
);

categorySchema.plugin(slugGenerator);

const Category = mongoose.model('Category', categorySchema);

export default Category;
