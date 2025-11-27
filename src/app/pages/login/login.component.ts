import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Login } from '../../models/login';
import { AuthService } from '../../services/auth.service';
import { AuthStateService } from '../../services/auth-state.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ FormsModule, CommonModule ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
 
   login: Login = new Login();

  router = inject(Router);

  loginService = inject(AuthService);
  authState = inject(AuthStateService);


  constructor(){
    this.loginService.removerToken();
  }


  logar() {

    this.loginService.logar(this.login).subscribe({
      next: token => {

        if (token) {
          this.loginService.addToken(token); //MUITO IMPORTANTE
          // decode token and set current user in auth state
          try {
            const usuario = this.loginService.getUsuarioLogado();
            if (usuario) this.authState.currentUser = usuario;
          } catch (e) {
            console.warn('Não foi possível decodificar usuário do token', e);
          }
        }

        this.gerarToast().fire({ icon: "success", title: "Seja bem-vindo!" });
        this.router.navigate(['/dashboard']);

        this.router.navigate(['/vendas']);
      },
      error: erro => {
        Swal.fire('Usuário ou senha incorretos!', '', 'error');
      }
    });

  }

  gerarToast() {
    return Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast: any) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
  }


}
