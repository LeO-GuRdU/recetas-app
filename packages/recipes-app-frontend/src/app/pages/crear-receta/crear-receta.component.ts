import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray,  Validators } from '@angular/forms';
import { GraphqlService } from '../../services/graphql.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-crear-receta',
  templateUrl: './crear-receta.component.html',
  styleUrls: ['./crear-receta.component.scss']
})
export class CrearRecetaComponent implements OnInit {
  recetaForm: FormGroup = new FormGroup({});

  constructor(
    private fb: FormBuilder,
    private readonly graphqlService: GraphqlService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.recetaForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      image: [''],
      ingredients: this.fb.array([this.createIngredient()]),
      steps: this.fb.array([this.createStep()]), 
    });
  }

  // Método para crear un ingrediente
  createIngredient(): FormGroup {
    return this.fb.group({
      quantity: [null, [Validators.required, Validators.min(0)]],
      unit: ['', Validators.required],
      name: ['', Validators.required],
    });
  }

  // Método para crear un paso
  createStep(): FormGroup {
    return this.fb.group({
      description: ['', Validators.required],
    });
  }

  // Obtener la lista de ingredientes (FormArray)
  get ingredients(): FormArray {
    return this.recetaForm.get('ingredients') as FormArray;
  }

  // Obtener la lista de pasos (FormArray)
  get steps(): FormArray {
    return this.recetaForm.get('steps') as FormArray;
  }

  // Método para agregar un ingrediente
  addIngredient(): void {
    this.ingredients.push(this.createIngredient());
  }

  // Método para agregar un paso
  addStep(): void {
    this.steps.push(this.createStep());
  }

  onSubmit(): void {
    if (this.recetaForm.valid) {
      const recetaData = this.recetaForm.value;

      const ingredients = recetaData.ingredients.map((ingredient: any) => ({
        quantity: parseFloat(ingredient.quantity),
        unit: ingredient.unit,
        name: ingredient.name,
      }));

      const steps = recetaData.steps.map((step: any) => step.description);
      const sanitizedSteps = steps.filter((step: string) => step && step.trim() !== '');

      this.graphqlService.createRecipe(
        recetaData.title,
        recetaData.description,
        recetaData.category,
        recetaData.image || null,
        ingredients,
        sanitizedSteps,
        this.authService.user.id,
      ).then(response => {
        console.log('Receta creada:', response);
        this.router.navigate(['/recetas']);  // Redirige después de crear la receta
      }).catch(error => {
        console.error('Error al crear la receta', error);
      });
    }
  }
}
