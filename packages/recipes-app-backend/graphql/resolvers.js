const User = require('../models/User');
const Recipe = require('../models/Recipe');

const resolvers = {
  Query: {
    // Traer todas las recetas (con filtros opcionales)
    getAllRecipes: async (_, { filter }) => {
      const query = {};
      if (filter?.category) query.category = filter.category;
      if (filter?.title) query.title = { $regex: filter.title, $options: 'i' };

      return await Recipe.find(query);
    },
    getRecipeById: async (_, { id }) => {
      return await Recipe.findById(id);
    },

    // Obtener las recetas de un usuario específico
    async getUserRecipes(_, { userId }) {
      return await Recipe.find({ userId }); // Filtrar por userId
    },
  },

  Mutation: {
    // Crear o buscar un usuario por Google ID
    async createOrFindUser(_, { googleId, email, name }) {
      try {
        // Buscar al usuario en la base de datos
        let user = await User.findOne({ googleId });
        if (!user) {
          // Si no existe, crearlo
          user = new User({ googleId, email, name });
          await user.save();
        }
        return user; // Retornar el usuario encontrado o recién creado
      } catch (err) {
        console.error('Error creando o buscando al usuario:', err);
        throw new Error('No se pudo crear o buscar el usuario.');
      }
    },
    // Crear una receta
    async createRecipe(_, { title, description, category, image, ingredients, steps }, context) {
      if (!context.userId) {
        throw new Error('No autenticado');
      }
    
      const recipe = new Recipe({
        title,
        description,
        category,
        image,
        userId: context.userId, // Asociar la receta al usuario autenticado
        ingredients,
        steps,
      });
      await recipe.save();
      return recipe;
    },
    // Modificar una receta
    updateRecipe: async (_, { id, input }, { req }) => {
      const user = authenticate(req);
      const recipe = await Recipe.findOneAndUpdate(
        { _id: id, userId: user.id }, // Solo permite modificar recetas propias
        { $set: input },
        { new: true }
      );
      if (!recipe) throw new Error('Receta no encontrada o no autorizada.');
      return recipe;
    },
    // Eliminar una receta
    deleteRecipe: async (_, { id }, { req }) => {
      const user = authenticate(req);
      const recipe = await Recipe.findOneAndDelete({ _id: id, userId: user.id });
      if (!recipe) throw new Error('Receta no encontrada o no autorizada.');
      return 'Receta eliminada exitosamente.';
    },
  },
};

module.exports = resolvers;
