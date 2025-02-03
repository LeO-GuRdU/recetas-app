const { gql } = require('apollo-server-express');
const { GraphQLUpload, processRequest } = require('graphql-upload');


const typeDefs = gql`
  # The implementation for this scalar is provided by the
  # 'GraphQLUpload' export from the 'graphql-upload' package
  # in the resolver map below.
  scalar Upload
  
type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }
  
  type User {
    _id: ID!
    googleId: String!
    email: String!
    name: String!
    createdAt: String
  }

  type Recipe {
    id: ID!
    title: String!
    description: String!
    category: String!
    image: String # Ruta o nombre del archivo guardado
    ingredients: [Ingredient!]!
    steps: [String!]!
    userId: ID! # Relación con usuario
    createdAt: String!
  }

  type Ingredient {
    quantity: Float!
    unit: String!
    name: String!
  }

  type AuthResponse {
    token: String!
    user: User!
  }

  type FileResponse {
    url: String!
  }

  type Query {
    # Consultar todas las recetas
    getAllRecipes(filter: RecipeFilterInput, limit: Int): [Recipe!]!

    # Consultar recetas para el usuario autenticado
    getUserRecipes: [Recipe!]! # Obtener recetas de un usuario

    # Consultar una receta específica
    getRecipeById(id: ID!): Recipe
  }

  type Mutation {
    # Crear un nuevo usuario o buscarlo por Google ID
    createOrFindUser(googleId: String!, email: String!, name: String!): User!

    # Crear una nueva receta
    createRecipe(
      title: String!
      description: String!
      category: String!
      image: String
      userId: ID! # El usuario que crea la receta
      ingredients: [IngredientInput!]!
      steps: [String!]!
    ): Recipe!

    # Modificar una receta
    updateRecipe(
        id: ID!
        title: String
        description: String
        category: String
        steps: [String!] # Pasos como array de strings
        ingredients: [IngredientInput!] # Ingredientes como array de objetos
    ): Recipe!

    # Subir imagen de receta
    uploadRecipeImage(file: Upload!): FileResponse!

    # Eliminar una receta
    deleteRecipe(id: ID!): String

    # Iniciar sesión con Google
    loginWithGoogle(token: String!): AuthResponse
  }

  input RecipeInput {
    title: String!
    description: String!
    category: String!
    ingredients: [IngredientInput!]!
    steps: [String!]!
  }

  input IngredientInput {
    quantity: Float!
    unit: String!
    name: String!
  }

  input RecipeFilterInput {
    category: String
    title: String
  }
`;

module.exports = typeDefs;
