const { gql } = require('apollo-server-express');


const typeDefs = gql`
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
    image: String
    ingredients: [Ingredient!]!
    steps: [String!]!
    userId: ID! # Relación con usuario
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

  type Query {
    # Consultar todas las recetas
    getAllRecipes: [Recipe!]!

    # Consultar recetas para el usuario autenticado
    getUserRecipes(userId: ID!): [Recipe!]! # Obtener recetas de un usuario

    # Consultar una receta específica
    getRecipeById(id: ID!): Recipe
  }

  type Mutation {
    # Crear un nuevo usuario o buscarlo por Google ID
    createOrFindUser(googleId: String!, email: String!, name: String!): User!

    # Crear una nueva receta
    createRecipe(
      title: String!
      description: String
      category: String
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
      image: String
      ingredients: [IngredientInput!]
      steps: [String!]
    ): Recipe

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
