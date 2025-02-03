import { Injectable } from '@angular/core';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client/core';
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs'; // Enlace para manejo de archivos
import { RecipeFilterInput } from '../interfaces/app.interfaces';

@Injectable({
  providedIn: 'root',
})
export class GraphqlService {
  private client: ApolloClient<any>;

  constructor() {
    const uploadLink = createUploadLink({
      uri: 'http://localhost:3000/graphql', // URL de tu backend GraphQL
      credentials: 'include', // Permite envío de cookies o credenciales
    });

    this.client = new ApolloClient({
      link: uploadLink, // Enlace configurado para manejar subidas de archivos
      cache: new InMemoryCache(), // Configuración de caché
    });
  }

  // Función para ejecutar una mutación con subida de archivos
  uploadRecipeImage(file: File): Promise<any> {
    const UPLOAD_IMAGE_MUTATION = gql`
    mutation uploadRecipeImage($file: Upload!) {
      uploadRecipeImage(file: $file) {
        url
      }
    }
  `;

    return this.client.mutate({
      mutation: UPLOAD_IMAGE_MUTATION,
      variables: { file },
      context: {
        useMultipart: true, // Necesario para manejar archivos
      },
    });
  }

  // Función para ejecutar una mutación que crea una receta
  createRecipe(
    title: string,
    description: { description: string; time: number; quantity: number },
    category: string,
    image: string | null,
    ingredients: { quantity: number; unit: string; name: string }[],
    steps: string[],
    userId: string
  ): Promise<any> {
    const CREATE_RECIPE = gql`
      mutation createRecipe(
        $title: String!,
        $description: DescriptionInput!,
        $category: String!,
        $image: String,
        $ingredients: [IngredientInput!]!,
        $steps: [String!]!,
        $userId: ID!
      ) {
        createRecipe(
          title: $title,
          description: $description,
          category: $category,
          image: $image,
          ingredients: $ingredients,
          steps: $steps,
          userId: $userId
        ) {
          id
          title
          description {
            description
            time
            quantity
          }
          category
          image
          ingredients {
            quantity
            unit
            name
          }
          steps
          userId
        }
      }
    `;

    return this.client.mutate({
      mutation: CREATE_RECIPE,
      variables: {
        title,
        description,
        category,
        image,
        ingredients,
        steps,
        userId,
      },
    });
  }

  // Función para ejecutar una mutación que actualiza una receta
  updateRecipe(id: string, title: string, description: string, category: string, ingredients: any[], steps: string[]): Promise<any> {
    const UPDATE_RECIPE_MUTATION = gql`
      mutation updateRecipe($id: ID!, $title: String, $description: DescriptionInput, $category: String, $ingredients: [IngredientInput!], $steps: [String!]) {
        updateRecipe(id: $id, title: $title, description: $description, category: $category, ingredients: $ingredients, steps: $steps) {
          id
          title
          description {
            description
            time
            quantity
          }
          category
          ingredients {
            quantity
            unit
            name
          }
          steps
        }
      }
    `;

    return this.client.mutate({
      mutation: UPDATE_RECIPE_MUTATION,
      variables: { id, title, description, category, ingredients, steps },
    });
  }

  getRecetas(limit: number, tipo?: RecipeFilterInput): Promise<any> {
    const GET_RECETAS_QUERY = gql`
    query GetAllRecipes($limit: Int, $tipo: RecipeFilterInput) {
      getAllRecipes(limit: $limit, filter: $tipo) {
        id
        title
        description {
            description
            time
            quantity
        }
        category
        image
        createdAt
      }
    }
  `;

    return this.client.query({
      query: GET_RECETAS_QUERY,
      variables: { limit, tipo },
    });
  }

  getUserRecetas(): Promise<any> {
    const GET_USER_RECETAS_QUERY = gql`
    query GetUserRecipes {
      getUserRecipes {
        id
        title
        description {
            description
            time
            quantity
        }
        category
        image
        createdAt
      }
    }
  `;

    return this.client.query({
      query: GET_USER_RECETAS_QUERY,
    });
  }

  getReceta(id: string) {
    const GET_RECETA_QUERY = gql`
    query GetRecipeById($id: ID!) {
      getRecipeById(id: $id) {
        id
        title
        description {
            description
            time
            quantity
        }
        category
        image
        ingredients {
          quantity
          unit
          name
        }
        steps
        userId
        createdAt
      }
    }
  `;
    const query = this.client.watchQuery({
      query: GET_RECETA_QUERY,
      variables: { id },
    });

    return query; // Retorna directamente el ObservableQuery
  }
}
