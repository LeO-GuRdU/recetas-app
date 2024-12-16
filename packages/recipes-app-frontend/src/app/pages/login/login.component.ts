import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginWithGoogle() {
    window.location.href = 'http://localhost:3000/auth/google'; // Redirige al login de Google
  }
}