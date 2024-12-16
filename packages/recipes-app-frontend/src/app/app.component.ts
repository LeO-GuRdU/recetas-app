import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isLoggedIn = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Capturar el token de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      // Guardar el token en localStorage
      localStorage.setItem('authToken', token);

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
}
