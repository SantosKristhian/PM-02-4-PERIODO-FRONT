import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';

const STORAGE_KEY = 'emanager_current_user';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private auth = inject(AuthService);

 
  get currentUser(): any | null {
    try {
    
      const fromToken = this.auth.getUsuarioLogado();
      if (fromToken && Object.keys(fromToken).length) return fromToken;

    
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  set currentUser(u: any | null) {
    try {
      if (u) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      } else {
        localStorage.removeItem(STORAGE_KEY);
        
        this.auth.removerToken();
      }
    } catch {
      
    }
  }

  isAdmin(): boolean {
    const u = this.currentUser;
    return !!u && (u.cargo === 'ADM' || u.cargo === 'ADMIN');
  }

  isVendedor(): boolean {
    const u = this.currentUser;
    return !!u && u.cargo === 'VENDEDOR';
  }

  logout() {
    
    this.currentUser = null;
    this.auth.removerToken();
  }
}
