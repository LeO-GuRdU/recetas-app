import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { MainComponent } from './pages/main/main.component';
import { RecetasComponent } from './pages/recetas/recetas.component';
import { CrearRecetaComponent } from './pages/crear-receta/crear-receta.component';
import { AuthGuard } from './guards/auth.guard';
import {MisRecetasComponent} from "./pages/mis-recetas/mis-recetas.component";
import {VerRecetaComponent} from "./pages/ver-receta/ver-receta.component";
import {EditarRecetaComponent} from "./pages/editar-receta/editar-receta.component";

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'main', component: MainComponent, canActivate: [AuthGuard] },
  { path: 'recetas', component: RecetasComponent, canActivate: [AuthGuard] },
  { path: 'mis-recetas', component: MisRecetasComponent, canActivate: [AuthGuard]  },
  { path: 'crear-receta', component: CrearRecetaComponent, canActivate: [AuthGuard] },
  { path: 'ver-receta/:id', component: VerRecetaComponent, canActivate: [AuthGuard] },
  { path: 'editar-receta/:id', component: EditarRecetaComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
