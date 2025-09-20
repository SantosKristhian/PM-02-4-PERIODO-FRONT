import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // <-- importado
import { AuthService } from '../../../../core/services/auth.service';

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
  loginData = { login: '', senha: '' };
  erro = '';

  constructor(
    private authService: AuthService,
    private router: Router // <-- injetado
  ) {}

  login() {
    this.authService.login(this.loginData).subscribe({
      next: (res) => {
        console.log('Login bem-sucedido', res);
        this.erro = '';

        // redireciona para a rota de listagem de produtos
        this.router.navigate(['/produtos/list']); 
      },
      error: (err) => {
        this.erro = 'Login ou senha incorretos!';
      }
    });
  }
}
