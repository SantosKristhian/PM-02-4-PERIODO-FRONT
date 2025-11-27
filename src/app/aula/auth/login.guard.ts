import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const loginGuard: CanActivateFn = (route, state) => {

let loginService = inject(AuthService);

if(loginService.hasCargo("VENDEDOR") && state.url == '/dashboard' ){
  alert ('voce nao tem permissão');
  return false;
}

if(loginService.hasCargo("VENDEDOR") && state.url == '/relatorios' ){
  alert ('voce nao tem permissão');
  return false;
}

if(loginService.hasCargo("VENDEDOR") && state.url == '/categorias' ){
  alert ('voce nao tem permissão');
  return false;
}

if(loginService.hasCargo("VENDEDOR") && state.url == '/usuarios' ){
  alert ('voce nao tem permissão');
  return false;
}



  return true;
};
