const mongoose = require('mongoose');

const IngredientSchema = new mongoose.Schema({
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  name: { type: String, required: true },
});

const RecipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['entrada', 'acompañamiento', 'principal', 'postre'], required: true },
  image: { type: String },
  ingredients: [IngredientSchema],
  steps: [String],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Recipe', RecipeSchema);
