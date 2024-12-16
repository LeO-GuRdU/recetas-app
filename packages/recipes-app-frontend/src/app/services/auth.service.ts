import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  // Este método se llamaría cuando el usuario se loguea correctamente con Google
  setUser(user: any): void {
    this.userSubject.next(user);
  }

  get user() {
    return this.userSubject.value;
  }

  logout() {
    this.userSubject.next(null);
    localStorage.removeItem('token');
  }
}
