import { Component, input, Input, output, inject } from '@angular/core';
import { AuthService } from '../../../Core/auth/auth-service';
import { Router } from '@angular/router'

export interface LogoutData {
  user: string;
  time: Date;
}

interface User {
  name: string;
  age: number;
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
  @Input() appName = '';

  user = input<User>();

  logout = output<LogoutData>();

  onLogout() {
    this.logout.emit({
      user: 'ThanhKido',
      time: new Date()
    });
  }

  logoutt() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}