import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GraphqlService } from '../../services/graphql.service';
import {defaultImages} from "../../app.const";

@Component({
  selector: 'app-ver-receta',
  templateUrl: './ver-receta.component.html',
  styleUrls: ['./ver-receta.component.scss']
})
export class VerRecetaComponent implements OnInit {
  receta: any; // Receta actual
  esPropietario: boolean = false; // Indica si el usuario es el propietario

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private graphqlService: GraphqlService
  ) {}

  ngOnInit(): void {
    const recetaId = this.route.snapshot.paramMap.get('id');
    if (recetaId) {
      this.cargarReceta(recetaId);
    }
  }

  cargarReceta(id: string): void {
    const query = this.graphqlService.getReceta(id);

    query.subscribe({
      next: (result: any) => {
        this.receta = result.data.getRecipeById;

        // Verificar si el usuario actual es el propietario
        const usuarioId = localStorage.getItem('userId'); // Obtener el ID del usuario actual
        this.esPropietario = this.receta.userId === usuarioId;
      },
      error: (err) => {
        console.error('Error al cargar la receta:', err);
      },
    });
  }

  editarReceta(): void {
    this.router.navigate(['/editar-receta', this.receta.id]); // Navegar a la página de edición
  }

  getImageUrl(receta: any): string {
    return receta.image ? receta.image : defaultImages[receta.category];
  }
}
