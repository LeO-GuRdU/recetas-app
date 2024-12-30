import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GraphqlService } from '../../services/graphql.service';
import {defaultImages, imgPath} from "../../app.const";
import {AuthService} from "../../services/auth.service";

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
    private graphqlService: GraphqlService,
    private readonly authService: AuthService,
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
        const usuario = this.authService.user; // Obtener el ID del usuario actual
        console.log('Usuario: ', usuario);
        console.log('Receta: ', this.receta);
        this.esPropietario = this.receta.userId === usuario.id;
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
    return receta.image ? imgPath + receta.image : defaultImages[receta.category];
  }
}
