import { Injectable } from '@angular/core';

const STORAGE_KEY = 'emanager_current_user';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  get currentUser(): any | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  set currentUser(u: any | null) {
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
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
  }
}
