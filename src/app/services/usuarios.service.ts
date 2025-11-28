import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Usuario {
  id: number;
  nome: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = environment.SERVIDOR + '/user';

  constructor(private http: HttpClient) {}

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/findAll`);
  }

  existemUsuarios(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists`);
  }

  existeAdministrador(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists-admin`);
  }

  login(login: string, senha: string): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/login`, { login, senha });
  }

  criarUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/save`, usuario);
  }
}
