import {ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GraphqlService } from '../../services/graphql.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-editar-receta',
  templateUrl: './editar-receta.component.html',
  styleUrls: ['./editar-receta.component.scss']
})
export class EditarRecetaComponent implements OnInit {
  recetaForm: FormGroup = new FormGroup({});
  receta: any = {}; // Receta actual
  userId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private readonly graphqlService: GraphqlService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const recetaId = this.route.snapshot.paramMap.get('id');
    this.userId = this.authService.user?.id;

    if (recetaId) {
      this.cargarReceta(recetaId);
    }
  }

  cargarReceta(id: string): void {
    const query = this.graphqlService.getReceta(id);

    query.subscribe({
      next: (result: any) => {
        this.receta = result.data.getRecipeById;
        this.inicializarFormulario();
        this.cdr.detectChanges(); // Hacer la detección de cambios manualmente
      },
      error: (err) => {
        console.error('Error al cargar la receta:', err);
      },
    });
  }

  get ingredients(): FormArray {
    return this.recetaForm.get('ingredients') as FormArray;
  }

  get steps(): FormArray {
    return this.recetaForm.get('steps') as FormArray;
  }

  addIngredient(): void {
    this.ingredients.push(this.createIngredient());
  }

  createIngredient(): FormGroup {
    return this.fb.group({
      quantity: [null, [Validators.required, Validators.min(0)]],
      unit: ['', Validators.required],
      name: ['', Validators.required],
    });
  }

  removeIngredient(index: number): void {
    this.ingredients.removeAt(index);
  }

  addStep(): void {
    this.steps.push(this.createStep());
  }

  removeStep(index: number): void {
    this.steps.removeAt(index);
  }

  createStep(): FormGroup {
    return this.fb.group({
      description: ['', Validators.required],
    });
  }

  inicializarFormulario(): void {
    console.log('Receta Traida: ', this.receta);
    this.recetaForm = this.fb.group({
      title: [this.receta?.title || '', Validators.required],
      description: this.fb.group({
        description: [this.receta?.description.description, Validators.required],
        time: [this.receta?.description.time, Validators.required],
        quantity: [this.receta?.description.quantity, Validators.required],
      }),
      category: [this.receta?.category || '', Validators.required],
      ingredients: this.fb.array(
        this.receta?.ingredients.map((ingredient: any) =>
          this.fb.group({
            quantity: [ingredient.quantity, Validators.required],
            unit: [ingredient.unit, Validators.required],
            name: [ingredient.name, Validators.required]
          })
        ) || []
      ),
      steps: this.fb.array(
        this.receta?.steps.map((step: any) =>
          this.fb.group({ description: [step, Validators.required] })
        ) || []
      )
    });
  }

  onSubmit(): void {
    if (this.recetaForm.valid) {
      const updatedRecipe = this.recetaForm.value;
      updatedRecipe.steps = updatedRecipe.steps.map((step: { description: string }) => step.description);
      console.log('Receta actualizada:', updatedRecipe);
      this.graphqlService
        .updateRecipe(
          this.receta.id,
          updatedRecipe.title,
          updatedRecipe.description,
          updatedRecipe.category,
          updatedRecipe.ingredients,
          updatedRecipe.steps,
        )
        .then(() => this.router.navigate(['/mis-recetas']));
    }
  }
}
