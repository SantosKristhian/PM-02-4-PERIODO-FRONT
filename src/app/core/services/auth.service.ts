import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  
  private baseUrl = 'http://localhost:8080/api/emanager'; 

  constructor(private http: HttpClient) { }

  login(usuario: Usuario): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, usuario); 
  }
}
