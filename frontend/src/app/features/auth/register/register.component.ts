import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, MatIconModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <a routerLink="/catalog" class="auth-logo">🕮 Book Store</a>
          <h1>Creează un cont</h1>
          <p>Alătură-te comunității noastre de cititori</p>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Prenume</label>
            <input type="text" [(ngModel)]="firstName" placeholder="Maria"/>
          </div>
          <div class="form-group">
            <label>Nume</label>
            <input type="text" [(ngModel)]="lastName" placeholder="Ionescu"/>
          </div>
        </div>

        <div class="form-group">
  <label>Email</label>
  <input type="email" [(ngModel)]="email"
       placeholder="email@exemplu.com"
       (blur)="emailInvalid = email.length > 0 && !/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email)"/>
  @if (emailInvalid) {
    <p class="email-warning">⚠️ Adresă de email invalidă!</p>
  }
</div>

        <div class="form-group">
          <label>Parolă</label>
          <div class="password-wrap">
            <input [type]="showPassword() ? 'text' : 'password'"
                   [(ngModel)]="password" placeholder="Minim 6 caractere"/>
            <button class="toggle-pass" (click)="showPassword.set(!showPassword())">
              <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </div>
        </div>

        @if (error()) {
          <p class="error-msg">{{ error() }}</p>
        }

        <button class="btn-submit" (click)="register()" [disabled]="loading()">
          {{ loading() ? 'Se creează contul...' : 'Înregistrare' }}
        </button>

        <p class="auth-footer">
          Ai deja cont?
          <a routerLink="/auth/login">Autentifică-te</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      background: var(--beige);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .auth-card {
      background: var(--white);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 2.5rem;
      width: 100%;
      max-width: 420px;
    }

    .auth-header { text-align: center; margin-bottom: 2rem; }

    .auth-logo {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--text-primary);
      display: block;
      margin-bottom: 1.25rem;
    }

    .auth-header h1 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.8rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.3rem;
    }

    .auth-header p { font-size: 0.875rem; color: var(--text-muted); }

    .form-row {
      display: flex;
      gap: 0.75rem;
    }

    .form-row .form-group { flex: 1; }

    .form-group { margin-bottom: 1rem; }

    .form-group label {
      display: block;
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: 0.4rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .form-group input {
      width: 100%;
      padding: 0.65rem 0.9rem;
      border: 1px solid var(--border-2);
      border-radius: var(--radius);
      font-family: 'Jost', sans-serif;
      font-size: 0.9rem;
      color: var(--text-primary);
      background: var(--beige);
      outline: none;
      transition: border-color 0.15s;
    }

    .form-group input:focus { border-color: var(--caramel); background: var(--white); }

    .password-wrap { position: relative; }
    .password-wrap input { padding-right: 2.5rem; }

    .toggle-pass {
      position: absolute;
      right: 0.6rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 0;
      transition: color 0.15s;
    }

    .toggle-pass:hover { color: var(--caramel); }
    .toggle-pass mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }

    .error-msg {
      font-size: 0.85rem;
      color: #B05050;
      background: #FFF5F5;
      border: 1px solid #F5C6C6;
      border-radius: var(--radius);
      padding: 0.6rem 0.9rem;
      margin-bottom: 1rem;
    }
.email-warning {
  font-size: 0.8rem;
  color: #D97706;
  background: #FEF3C7;
  border: 1px solid #FDE68A;
  border-radius: var(--radius);
  padding: 0.4rem 0.7rem;
  margin-top: 0.3rem;
}
    .btn-submit {
      width: 100%;
      padding: 0.75rem;
      background: var(--caramel);
      color: white;
      border: none;
      border-radius: var(--radius);
      font-family: 'Jost', sans-serif;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s;
      margin-bottom: 1.25rem;
    }

    .btn-submit:hover:not(:disabled) { background: var(--caramel-dark); }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

    .auth-footer {
      text-align: center;
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    .auth-footer a {
      color: var(--caramel-dark);
      font-weight: 500;
    }

    .auth-footer a:hover { color: var(--caramel); }
  `]
})
export class RegisterComponent {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  showPassword = signal(false);
  loading = signal(false);
  error = signal('');
  emailInvalid = false;

  constructor(private authService: AuthService, private router: Router) {}

  register() {
  this.error.set('');

  if (!this.firstName || !this.lastName || !this.email || !this.password) {
    this.error.set('Completează toate câmpurile!');
    return;
  }

  if (this.firstName.length < 2) {
    this.error.set('Prenumele trebuie să aibă minim 2 caractere!');
    return;
  }

  if (this.lastName.length < 2) {
    this.error.set('Numele trebuie să aibă minim 2 caractere!');
    return;
  }

 if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(this.email)) {
  this.emailInvalid = true;
  this.error.set('Adresă de email invalidă!');
  return;
}

  this.emailInvalid = false;

  if (this.password.length < 6) {
    this.error.set('Parola trebuie să aibă minim 6 caractere!');
    return;
  }

  this.loading.set(true);

  this.authService.register({
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    password: this.password
  }).subscribe({
    next: (user) => {
      this.authService.setUser(user);
      this.router.navigate(['/catalog']);
    },
    error: () => {
      this.error.set('Eroare la înregistrare. Emailul este deja folosit!');
      this.loading.set(false);
    }
  });
}
}