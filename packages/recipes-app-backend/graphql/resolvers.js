const User = require('../models/User');
const Recipe = require('../models/Recipe');
const fs = require('fs');
const path = require('path');

const resolvers = {
  Upload: require('graphql-upload').GraphQLUpload, // Scalar para manejar la subida de archivos

  Query: {
    // Traer todas las recetas (con filtros opcionales)
    getAllRecipes: async (_, { filter, limit }) => {
      const query = {};
      if (filter?.category) query.category = filter.category;
      if (filter?.title) query.title = { $regex: filter.title, $options: 'i' };

      return await Recipe.find(query).sort({ createdAt: -1 }).limit(limit);
    },
    getRecipeById: async (_, { id }) => {
      return await Recipe.findById(id);
    },

    // Obtener las recetas de un usuario específico
    getUserRecipes: async (_, __, { userId }) => {
      if (!userId) {
        throw new Error('Not authenticated');
      }
      return await Recipe.find({ userId });
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
    async createRecipe(_, { title, description, category, image, ingredients, steps, userId }, context) {
      const user = userId || context.userId;

      if (!user) {
        throw new Error('Not authenticated');
      }

      let imagePath = null;

      if (image) {
        const { createReadStream, filename } = await image;
        imagePath = path.join(__dirname, 'uploads', filename);
        await new Promise((resolve, reject) => {
          createReadStream()
              .pipe(fs.createWriteStream(imagePath))
              .on('finish', resolve)
              .on('error', reject);
        });
      }

      const recipe = new Recipe({
        title,
        description,
        category,
        image: imagePath ? `/uploads/${filename}` : null, // Use the image path if available
        userId: user,
        ingredients,
        steps,
      });
      await recipe.save();
      return recipe;
    },

    uploadRecipeImage: async (parent, { file }) => {
      try {
        const { createReadStream, filename, mimetype, encoding } = await file;
        const imagePath = path.join(__dirname, 'uploads', filename);

        // Validate file type (optional)
        const allowedTypes = ['image/jpeg', 'image/png'];
        if (!allowedTypes.includes(mimetype)) {
          throw new Error('Invalid file type. Only JPEG and PNG are allowed.');
        }

        await new Promise((resolve, reject) => {
          createReadStream()
            .pipe(fs.createWriteStream(imagePath))
            .on('finish', resolve)
            .on('error', reject);
        });

        return { url: `/uploads/${filename}` };
      } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Error uploading the image.');
      }
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
