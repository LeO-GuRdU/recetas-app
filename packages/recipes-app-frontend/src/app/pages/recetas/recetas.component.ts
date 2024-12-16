import { Component, OnInit } from '@angular/core';
import { RecetasService } from '../../services/recetas.service'; // Asegúrate de la ruta correcta
import { Router } from '@angular/router';

@Component({
  selector: 'app-recetas',
  templateUrl: './recetas.component.html',
  styleUrls: ['./recetas.component.scss']
})
export class RecetasComponent implements OnInit {
  recetas: any[] = [];
  limit: number = 10; // Límite por defecto
  isLoading: boolean = true;
  noRecipes: boolean = false;

  constructor(private readonly recetasService: RecetasService, private readonly router: Router) {}

  ngOnInit(): void {
    this.loadRecetas();
  }

  // Cargar las recetas desde el backend
  loadRecetas(): void {
    this.isLoading = true;
    this.recetasService.getRecetas(this.limit).subscribe(
      (response) => {
        if (response && response.length > 0) {
          this.recetas = response;
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

  // Cambiar el límite de recetas
  onLimitChange(limit: number): void {
    this.limit = limit;
    this.loadRecetas();
  }

  // Navegar a la página de crear receta
  navigateToCreateRecipe(): void {
    this.router.navigate(['/crear-receta']);
  }
}
