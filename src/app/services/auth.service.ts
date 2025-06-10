// src/app/services/auth.service.ts

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private router = inject(Router);
  
  constructor(private http: HttpClient) { }

  private apiUrl = 'http://localhost:8080/usuario';
  private currentUser: any = null;

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { username, password }).pipe(
      tap((user: any) => {
        this.currentUser = user;
        localStorage.setItem('user', JSON.stringify(user));
        // this.redirectByRole(user.idPerfil);
      }),
      catchError(err => {
        console.error('Login failed', err);
        return of(null);
      })
    );
  }

  resetPassword(username: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, {username}, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('user');
    window.location.reload();
  }

  getCurrentUser() {
    if (!this.currentUser) {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        this.currentUser = JSON.parse(userJson);
      }
    }
    return this.currentUser;
  }

}
