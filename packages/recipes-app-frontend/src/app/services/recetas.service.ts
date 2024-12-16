import { Injectable, forwardRef, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class RecetasService {
  private readonly apiUrl = 'http://localhost:3000/api/recetas';  // Cambia esta URL según tu backend

  constructor(
    private readonly http: HttpClient,
    @Inject(forwardRef(() => AuthService)) private readonly authService: AuthService
  ) {}

  // Obtener recetas con un límite determinado
  getRecetas(limit: number): Observable<any> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<any>(this.apiUrl, { params });
  }

  // Crear nueva receta
  createReceta(receta: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, receta);
  }
}
