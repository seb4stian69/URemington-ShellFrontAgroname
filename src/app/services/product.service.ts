// src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Perfil } from '../interfaces/perfil';
import { PersonaDto } from '../interfaces/personaDto';
import { UsuarioDto } from '../interfaces/usuarioDto';
import { Persona } from '../interfaces/persona';
import { Usuario } from '../interfaces/usuario';
import { PerfilDto } from '../interfaces/perfilDto';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  
  constructor(private http: HttpClient) { }

  private apiUrl = 'http://localhost:3000';

  getAllProductos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/productos`).pipe(
      map((response: any[]) =>
        response.map((p: any) => {
          return p;
        })
      )
    );
  }
}