import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  user: any;
  isSidebarCollapsed = false;  // Estado para el colapso de la sidebar

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    // Capturar el token de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');


    if (token) {
      // Guardar el token en localStorage
      localStorage.setItem('authToken', token);
        const decodedToken = this.decodeToken(token); // Decodifica el token si es válido
        this.setUser(decodedToken);  // Establece el usuario en el servicio de autenticación

      // Limpiar la URL para evitar que el token sea visible
      window.history.replaceState({}, document.title, '/');

      // Establecer el estado de autenticación y redirigir al /main
      this.isLoggedIn = true;
      this.router.navigate(['/main']);
    } else if (localStorage.getItem('authToken')) {
      // Si ya existe un token en localStorage, considera al usuario autenticado
      this.isLoggedIn = true;
      this.router.navigate(['/main']);
    } else {
      // Si no hay token, redirigir al login
      this.isLoggedIn = false;
      this.router.navigate(['/login']);
    }
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;  // Cambiar el estado
  }

  decodeToken(token: string) {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  }

  setUser(user: any): void {
    this.user = user;
    this.authService.setUser(user);
  }
}
