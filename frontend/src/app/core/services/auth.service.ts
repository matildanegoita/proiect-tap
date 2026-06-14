import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/Auth`;
  
  // Signals pentru state
  currentUser = signal<User | null>(null);
isLoggedIn = computed(() => !!this.currentUser());
isAdmin = computed(() => this.currentUser()?.role === 'Admin');

constructor(private http: HttpClient, private router: Router) {
  const stored = this.getUserFromStorage();
  if (stored) {
    this.currentUser.set(stored);
  }
}

  register(data: { firstName: string; lastName: string; email: string; password: string }) {
    return this.http.post<User>(`${this.apiUrl}/register`, data);
  }

  login(data: { email: string; password: string }) {
    return this.http.post<User>(`${this.apiUrl}/login`, data).pipe();
  }

  setUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return this.currentUser()?.token ?? null;
  }

  private getUserFromStorage(): User | null {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}
}