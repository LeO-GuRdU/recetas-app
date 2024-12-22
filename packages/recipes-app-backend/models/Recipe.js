const mongoose = require('mongoose');

// Esquema de Ingredientes
const IngredientSchema = new mongoose.Schema({
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  name: { type: String, required: true },
});

// Esquema de Recetas
const RecipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: ['entrada', 'acompañamiento', 'principal', 'postre'], required: true },
    image: { type: String },  // Ruta relativa de la imagen guardada
    ingredients: [IngredientSchema],
    steps: [String],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true } // Añade createdAt y updatedAt automáticamente
);

module.exports = mongoose.model('Recipe', RecipeSchema);
