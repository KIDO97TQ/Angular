import { Component, inject, HostListener } from '@angular/core';
import { AuthService } from '../../../Core/auth/auth-service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router'
import { CommonModule } from '@angular/common';
import { CartsService } from '../../../Core/services/carts';
import { FormsModule } from '@angular/forms';


interface User {
  name: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})

export class HeaderComponent {
  auth = inject(AuthService);
  router = inject(Router);
  cartService = inject(CartsService);
  menuOpen = false;
  userMenuOpen = false;

  hideTopBar = false;
  lastScrollY = window.scrollY;
  isHidden = false;

  @HostListener('window:scroll', [])
  onScroll() {
    const currentY = window.scrollY;
    const diff = currentY - this.lastScrollY;

    // scroll xuống
    if (diff > 5 && currentY > 80 && !this.isHidden) {
      this.isHidden = true;
      this.hideTopBar = true;
    }

    // scroll lên
    if (diff < -5 && this.isHidden) {
      this.isHidden = false;
      this.hideTopBar = false;
    }

    this.lastScrollY = currentY;
  }

  @HostListener('document:click')
  closeAllMenus() {
    this.userMenuOpen = false;
    this.menuOpen = false;
  }

  username: string | null = null;

  Loadingcart() {
    const userId = this.auth.getUserId();

    if (userId) {
      this.cartService.loadCartCount(userId).subscribe();
    }
  }

  ngOnInit() {
    this.Loadingcart();

    this.auth.user$.subscribe(name => {
      this.username = name;
    });

    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
  }


  logout() {
    this.userMenuOpen = false;
    this.menuOpen = false;
    this.auth.logout();
    this.cartService.resetCart();
    this.router.navigate(['/login']);
  }

  toggleUserMenu() {
    if (!this.username) {
      return;
    }
    this.userMenuOpen = !this.userMenuOpen;
  }

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.menuOpen = !this.menuOpen;
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

  searchKeyword = '';
  search() {
    if (!this.searchKeyword.trim()) return;

    this.router.navigate(['/products'], {
      queryParams: { keyword: this.searchKeyword }
    });
  }


}