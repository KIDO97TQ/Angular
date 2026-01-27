import { Component, inject, HostListener } from '@angular/core';
import { AuthService } from '../../../Core/auth/auth-service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router'
import { CommonModule } from '@angular/common';


interface User {
  name: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})

export class HeaderComponent {
  auth = inject(AuthService);
  router = inject(Router);
  menuOpen = false;
  userMenuOpen = false;

  @HostListener('document:click')
  closeUserMenu() {
    this.userMenuOpen = false;
    this.menuOpen = false;
  }

  authService = inject(AuthService);
  username: string | null = null;

  ngOnInit() {
    this.authService.user$.subscribe(name => {
      this.username = name;
    });
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  toggleTheme() {
    const html = document.documentElement;
    const toggle = document.querySelector('.theme-toggle');
    toggle?.classList.add('switching');
    setTimeout(() => toggle?.classList.remove('switching'), 400);
    const isDark = html.getAttribute('data-theme') === 'dark';
    const next = isDark ? 'light' : 'dark';

    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  }

}