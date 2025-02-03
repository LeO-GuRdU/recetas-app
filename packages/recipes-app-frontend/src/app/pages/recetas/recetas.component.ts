import { Component, OnInit } from '@angular/core';
import { GraphqlService } from '../../services/graphql.service';
import { Router } from '@angular/router';
import {defaultImages, imgPath} from "../../app.const";
import { RecipeFilterInput } from 'src/app/interfaces/app.interfaces';

@Component({
  selector: 'app-recetas',
  templateUrl: './recetas.component.html',
  styleUrls: ['./recetas.component.scss']
})
export class RecetasComponent implements OnInit {
  recetas: any[] = [];
  limit: number = 10;
  tipo: string = '';
  filtro: RecipeFilterInput = {
    category: '',
    title: ''
  };
  isLoading: boolean = true;
  noRecipes: boolean = false;

  constructor(private readonly graphqlService: GraphqlService, private readonly router: Router) {}

  ngOnInit(): void {
    this.loadRecetas();
  }

  loadRecetas(): void {
    this.isLoading = true;
    this.graphqlService.getRecetas(this.limit, this.filtro).then(
      (response: any) => {
        if (response.data.getAllRecipes && response.data.getAllRecipes.length > 0) {
          this.recetas = response.data.getAllRecipes;
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

  onLimitChange(limit: number): void {
    this.limit = limit;
    this.loadRecetas();
  }

  onTipoChange(tipo: string): void {
    this.filtro.category = tipo;
    this.loadRecetas();
  }

  navigateToCreateRecipe(): void {
    this.router.navigate(['/crear-receta']);
  }

  verReceta(id: string) {
    this.router.navigate(['/ver-receta', id]); // Navega a la vista de detalles
  }

  getImageUrl(receta: any): string {
    return receta.image ? imgPath + receta.image : defaultImages[receta.category];
  }
}
