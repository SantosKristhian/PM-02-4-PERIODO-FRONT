import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthStateService } from '../../services/auth-state.service';
import { LoginRequest } from '../../models/login-request.model'; // <-- importado

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginData: LoginRequest = { login: '', senha: '' }; // <-- tipado certinho
  erro = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private authState: AuthStateService
  ) {}

  login() {
    this.authService.login(this.loginData).subscribe({
      next: (res) => {
        console.log('Login bem-sucedido', res);
        this.erro = '';
        // salvar usuario no localStorage
        this.authState.currentUser = res;
        // redireciona conforme cargo
        if (res.cargo === 'ADM') this.router.navigate(['/dashboard']);
        else this.router.navigate(['/vendas']);
      },
      error: () => {
        this.erro = 'Login ou senha incorretos!';
      }
    });
  }
}
