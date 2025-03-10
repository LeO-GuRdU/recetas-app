const User = require('../models/User');
const Recipe = require('../models/Recipe');
const {
  GraphQLUpload,
  graphqlUploadExpress, // A Koa implementation is also exported.
} = require('graphql-upload');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const resolvers = {
  // This maps the `Upload` scalar to the implementation provided
  // by the `graphql-upload` package.
  Upload: GraphQLUpload, // Scalar para manejar la subida de archivos

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

      const imagePath = image ?? null;

      const recipe = new Recipe({
        title,
        description,
        category,
        image: imagePath, // Use the image path if available
        userId: user,
        ingredients,
        steps,
      });
      await recipe.save();
      return recipe;
    },

    updateRecipe: async (_, { id, steps, ingredients, ...rest }) => {
      try {
        // Convertir el id a un ObjectId usando 'new' correctamente
        const objectId = new mongoose.Types.ObjectId(id);

        await Recipe.updateOne(
            { _id: objectId },
            {
              $set: {
                ...rest,
                steps, // Este ya será un array de strings
                ingredients, // Este será un array de objetos
              },
            }
        );

        // Recupera el documento actualizado
        return await Recipe.findById(id);
      } catch (error) {
        throw new Error(`Error al actualizar la receta: ${error.message}`);
      }
    },

    uploadRecipeImage: async (parent, { file }) => {
      try {
        const { createReadStream, filename, mimetype, encoding } = await file;
        const uploadsDir = path.join(__dirname, 'uploads');

        // Ensure the uploads directory exists
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const imagePath = path.join(uploadsDir, filename);

        // Validate file type (optional)
        const allowedTypes = ['image/jpeg', 'image/png'];
        if (!allowedTypes.includes(mimetype)) {
          throw new Error('Invalid file type. Only JPEG and PNG are allowed.');
        }

        console.log('Uploading file:', filename, mimetype, encoding);

        await new Promise((resolve, reject) => {
          createReadStream()
              .pipe(fs.createWriteStream(imagePath))
              .on('finish', resolve)
              .on('error', reject);
        });

        console.log('File uploaded successfully:', imagePath);

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
