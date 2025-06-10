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
export class AdminService {
  
  constructor(private http: HttpClient) { }

  private apiUrl = 'http://localhost:8080';

  getAllPersonas(): Observable<Persona[]> {
    return this.http.get<any[]>(`${this.apiUrl}/personas`).pipe(
      map((response: any[]) =>
        response.map((p: any) => {
          const [primerNombre, segundoNombre = ''] = (p.nombres || '').split(' ');
          const [primerApellido, segundoApellido = ''] = (p.apellidos || '').split(' ');

          return {
            personaId: p.id,
            primerNombre,
            segundoNombre,
            primerApellido,
            segundoApellido,
            direccion: p.direccion,
            telefono: p.telefono,
            celular: p.movil,
            correo: p.correo,
            fechaNacimiento: new Date(p.fechaNacimiento).toISOString().split('T')[0],
            estado: p.estado===true ? 'Activo' : 'Inactivo'
          } as Persona;
        })
      )
    );
  }

  savePersona(persona: PersonaDto): Observable<any> {
    console.log(persona);
    return this.http.post(`${this.apiUrl}/personas`, persona).pipe(
      tap((data: any) => {
        console.log(data);
      }),
      catchError(err => {
        console.error(`Save ${persona} failed`, err);
        return of(null);
      })
    );
  }

  savePerfiles(perfil: PerfilDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/perfil`, perfil).pipe(
      catchError(err => {
        console.error(`Save ${perfil} failed`, err);
        return of(null);
      })
    );
  }

  getAllPerfiles(): Observable<Perfil[]> {
    return this.http.get<any[]>(`${this.apiUrl}/perfil`).pipe(
      map((response: any[]) =>
        response.map((p: any) => ({
          id: p.id,
          descripcion: p.descripcion,
          estado: p.estado===true ? 'Activo' : 'Inactivo'
        } as Perfil))
      )
    );
  }

  saveUsuarios(usuario: UsuarioDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuario`, usuario).pipe(
      catchError(err => {
        console.error(`Save ${usuario} failed`, err);
        return of(null);
      })
    );
  }

  getAllUsuarios(): Observable<Usuario[]> {
  return this.http.get<any[]>(`${this.apiUrl}/usuario`).pipe(
    map((response: any[]) =>
      response.map((u: any) => ({
        usuarioId: u.id,
        nombreUsuario: u.nombreUsuario,
        contrasena: u.contrasena,
        perfil: Number(u.idPerfil),
        estado: u.estado==true ? 'Activo' : 'Inactivo'
      } as Usuario))
    )
  );
}

  softDelete(id: number|null, path: string): Observable<any>{
    return this.http.delete(`${this.apiUrl}/${path}/${id}`).pipe(
      catchError(err => {
        console.error(`Delete ${id} failed`, err);
        return of(null);
      })
    );
  }
  
}
