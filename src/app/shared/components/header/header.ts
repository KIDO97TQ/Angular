import { Component, input, Input, output, inject } from '@angular/core';
import { AuthService } from '../../../Core/auth/auth-service';
import { Router } from '@angular/router'

export interface LogoutData {
  user: string;
  time: Date;
}

interface User {
  name: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})

export class HeaderComponent {
  auth = inject(AuthService);
  router = inject(Router);

  authService = inject(AuthService);
  username: string | null = null;

  ngOnInit() {
    this.authService.user$.subscribe(name => {
      this.username = name;
    });
  }

  logoutt() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}