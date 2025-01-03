import { Component, OnInit } from '@angular/core';
import { GraphqlService } from '../../services/graphql.service';
import { Router } from '@angular/router';
import {defaultImages, imgPath} from "../../app.const";

@Component({
  selector: 'app-mis-recetas',
  templateUrl: './mis-recetas.component.html',
  styleUrls: ['./mis-recetas.component.scss']
})
export class MisRecetasComponent implements OnInit {
  recetas: any[] = [];
  isLoading: boolean = true;
  noRecipes: boolean = false;

  constructor(private readonly graphqlService: GraphqlService, private readonly router: Router) {}

  ngOnInit(): void {
    this.loadRecetas();
  }

  loadRecetas(): void {
    this.isLoading = true;
    this.graphqlService.getUserRecetas().then(
      (response: any) => {
        if (response.data.getUserRecipes && response.data.getUserRecipes.length > 0) {
          this.recetas = response.data.getUserRecipes;
          this.noRecipes = false;
        } else {
          this.noRecipes = true;
        }
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading recetas:', error);
        this.isLoading = false;
      }
    );
  }

  verReceta(id: string) {
    this.router.navigate(['/ver-receta', id]); // Navega a la vista de detalles
  }

  navigateToCreateRecipe(): void {
    this.router.navigate(['/crear-receta']);
  }

  getImageUrl(receta: any): string {
    return receta.image ? imgPath + receta.image : defaultImages[receta.category];
  }
}
