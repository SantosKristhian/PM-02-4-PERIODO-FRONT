import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // <-- necessário para *ngIf
import { AuthService } from '../../../../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,  // standalone component
  imports: [
    FormsModule,   // para ngModel
    CommonModule   // para *ngIf
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginData = { login: '', senha: '' };
  erro = '';

  constructor(private authService: AuthService) {}

  login() {
    this.authService.login(this.loginData).subscribe({
      next: (res) => {
        console.log('Login bem-sucedido', res);
      },
      error: (err) => {
        this.erro = 'Login ou senha incorretos!';
      }
    });
  }
}
