import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { defaultImages } from "./app.const";

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
    const tokenFromUrl = urlParams.get('token');

    let token: string | null = null;

    if (tokenFromUrl) {
      // Guardar el token de la URL en localStorage
      localStorage.setItem('authToken', tokenFromUrl);
      token = tokenFromUrl;

      // Limpiar la URL para evitar que el token sea visible
      window.history.replaceState({}, document.title, '/');
    } else {
      // Usar el token de localStorage si no hay token en la URL
      token = localStorage.getItem('authToken');
    }


    if (token) {
      const decodedToken = this.decodeToken(token); // Decodifica el token
      this.setUser(decodedToken); // Establece el usuario en el servicio de autenticación
      this.isLoggedIn = true;

      // Si es la primera vez (token desde la URL), redirigir al /main
      if (tokenFromUrl) {
        this.router.navigate(['/main']);
      }
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
    localStorage.setItem('user', JSON.stringify(user));
  }

  getImageUrl(user: any): string {
    return user?.avatarUrl ?? defaultImages['user'];
  }

  onLogout(){
    this.authService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }
}
