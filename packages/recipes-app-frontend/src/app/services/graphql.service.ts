import { Injectable } from '@angular/core';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client/core';
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs'; // Enlace para manejo de archivos

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
    console.log('ME LLEGA ESTO', file);
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
    description: string,
    category: string,
    image: string | null,
    ingredients: { quantity: number; unit: string; name: string }[],
    steps: string[],
    userId: string
  ): Promise<any> {
    const CREATE_RECIPE = gql`
      mutation createRecipe(
        $title: String!,
        $description: String!,
        $category: String!,
        $image: Upload,
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
          description
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

  getRecetas(limit: number): Promise<any> {
    const GET_RECETAS_QUERY = gql`
    query GetAllRecipes($limit: Int) {
      getAllRecipes(limit: $limit) {
        id
        title
        description
        category
        image
        createdAt
      }
    }
  `;

    return this.client.query({
      query: GET_RECETAS_QUERY,
      variables: { limit },
    });
  }

  getUserRecetas(): Promise<any> {
    const GET_USER_RECETAS_QUERY = gql`
    query GetUserRecipes {
      getUserRecipes {
        id
        title
        description
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
}
