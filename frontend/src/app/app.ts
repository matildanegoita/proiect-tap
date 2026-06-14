import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { CartService } from './core/services/cart.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    main { min-height: calc(100vh - 64px); background: var(--beige); }
  `]
})
export class AppComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.cartService.loadCart().subscribe();
    }
  }
}