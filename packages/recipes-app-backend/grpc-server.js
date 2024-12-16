const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const Recipe = require('./models/Recipe'); // Modelo Mongoose para recetas

// Cargar el archivo .proto
const PROTO_PATH = './recipe.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true,
});
const recipeProto = grpc.loadPackageDefinition(packageDefinition).recipe;

// Implementar el servicio
const recipeService = {
  BulkCreateRecipes: async (call, callback) => {
    try {
      const recipes = call.request.recipes;

      // Guardar recetas en MongoDB
      const createdRecipes = await Recipe.insertMany(recipes);
      const createdIds = createdRecipes.map((recipe) => recipe._id.toString());

      callback(null, {
        createdIds,
        message: 'Recetas creadas exitosamente',
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  },
  GetAllRecipes: async (call, callback) => {
    const filter = call.request;
    const query = {};
    if (filter.category) query.category = filter.category;
    if (filter.title) query.title = { $regex: filter.title, $options: 'i' };

    const recipes = await Recipe.find(query);
    callback(null, { recipes });
  },

  GetMyRecipes: async (call, callback) => {
    const userId = call.request.id;
    const recipes = await Recipe.find({ userId });
    callback(null, { recipes });
  },

  UpdateRecipe: async (call, callback) => {
    const { id, recipe } = call.request;
    const updatedRecipe = await Recipe.findOneAndUpdate(
      { _id: id },
      { $set: recipe },
      { new: true }
    );
    if (!updatedRecipe) {
      callback({
        code: grpc.status.NOT_FOUND,
        message: 'Receta no encontrada.',
      });
      return;
    }
    callback(null, updatedRecipe);
  },

  DeleteRecipe: async (call, callback) => {
    const { id } = call.request;
    const deletedRecipe = await Recipe.findByIdAndDelete(id);
    if (!deletedRecipe) {
      callback({
        code: grpc.status.NOT_FOUND,
        message: 'Receta no encontrada.',
      });
      return;
    }
    callback(null, { message: 'Receta eliminada exitosamente.' });
  },
};

// Configurar el servidor gRPC
const server = new grpc.Server();
server.addService(recipeProto.RecipeService.service, recipeService);

// Iniciar el servidor
const PORT = '50051';
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Error al iniciar el servidor gRPC:', err);
    return;
  }
  console.log(`Servidor gRPC ejecutándose en el puerto ${port}`);
  server.start();
});
