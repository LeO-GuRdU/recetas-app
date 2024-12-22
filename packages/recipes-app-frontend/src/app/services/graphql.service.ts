import { Injectable } from '@angular/core';
import { ApolloClient, InMemoryCache, Observable, gql } from '@apollo/client/core'; // Usar Apollo Client directamente
import { HttpLink } from '@apollo/client/link/http'; // Enlace HTTP para Apollo Client
import { ApolloLink } from '@apollo/client/link/core';
import { setContext } from '@apollo/client/link/context';



@Injectable({
  providedIn: 'root',
})
export class GraphqlService {
  private client: ApolloClient<any>;

  constructor() {
    // Configuración de Apollo Client
    const httpLink = new HttpLink({
      uri: 'http://localhost:3000/graphql',
      credentials: 'include', // Permite el envío de cookies o credenciales
    });

    this.client = new ApolloClient({
      link: httpLink,
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
      variables: {
        file,
      },
      context: {
        useMultipart: true,  // Apollo Client will handle the file upload
      },
    });
  }
  


  // Función para ejecutar una mutación
  createRecipe(title: string, description: string, category: string, image: string, ingredients: string[], steps: string[], userId: string) {
    const CREATE_RECIPE = gql`
      mutation createRecipe(
        $title: String!,
        $description: String!,
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
}
