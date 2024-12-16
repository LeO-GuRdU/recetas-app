import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor() {}

  loginWithGoogle(): void {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: '1074393430923-f2osfbdl6agti76t5gbtapha4v7s4j3l.apps.googleusercontent.com', // Reemplaza con tu client ID
        callback: (response: any) => this.handleCredentialResponse(response),
      });

      // Esto abrirá el cuadro de diálogo de login (sin depender de FedCM)
      window.google.accounts.id.prompt();
    } else {
      console.error('Google accounts SDK no está cargado correctamente');
    }
  }

  handleCredentialResponse(response: any) {
    console.log('Google login response:', response);
    this.userSubject.next(response);
  }

  logout(): void {
    this.userSubject.next(null);
  }

  isAuthenticated(): boolean {
    return this.userSubject.value !== null;
  }
}
