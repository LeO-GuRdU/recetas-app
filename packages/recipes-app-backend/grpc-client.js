const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Cargar el archivo .proto
const PROTO_PATH = './recipe.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true,
});
const recipeProto = grpc.loadPackageDefinition(packageDefinition).recipe;

// Configurar el cliente
const client = new recipeProto.RecipeService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// Método para llamar a BulkCreateRecipes
const bulkCreateRecipes = (recipes) => {
  client.BulkCreateRecipes({ recipes }, (error, response) => {
    if (error) {
      console.error('Error al crear recetas:', error.message);
    } else {
      console.log('Recetas creadas:', response);
    }
  });
};

// Ejemplo de uso
const recipes = [
  {
    title: 'Receta 1',
    description: 'Descripción de la receta 1',
    category: 'entrada',
    ingredients: [{ quantity: 2, unit: 'tazas', name: 'Harina' }],
    steps: ['Paso 1', 'Paso 2'],
    userId: '64f18f2e5e0b2c001f9a70a2',
  },
  {
    title: 'Receta 2',
    description: 'Descripción de la receta 2',
    category: 'postre',
    ingredients: [{ quantity: 1, unit: 'unidad', name: 'Huevo' }],
    steps: ['Paso 1', 'Paso 2'],
    userId: '64f18f2e5e0b2c001f9a70a2',
  },
];

bulkCreateRecipes(recipes);
