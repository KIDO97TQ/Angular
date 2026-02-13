import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartsService, CartItem } from '../../../Core/services/carts';
import { AuthService } from '../../../Core/auth/auth-service';
import { ToastrService } from 'ngx-toastr';
import { ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-carts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carts.html',
  styleUrl: './carts.css',
})

export class CartComponent implements OnInit {
  cartService = inject(CartsService);
  authService = inject(AuthService);
  router = inject(Router);
  toastr = inject(ToastrService);
  cd = inject(ChangeDetectorRef);
  isLoading = true;

  toggleSelection(cartId: number) {
    this.cartService.toggleSelection(cartId);
  }

  getProgressPercentage(): number {
    const itemCount = this.cartService.items().length;
    if (itemCount >= 2) return 100;
    return (itemCount / 4) * 100;
  }
  ngOnInit() {
    this.loadCart();
  }
  userId: string | null = null;
  loadCart() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const userId = this.authService.getUserId()!;
    this.userId = userId;
    this.cartService.getCartByUserId(userId).subscribe({
      next: () => {
        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.cd.detectChanges();
        this.toastr.error('Không thể tải giỏ hàng', 'Error');
        console.error(err);
      }
    });
  }

  updateQuantity(item: CartItem, change: number) {
    const newQuantity = item.quantity + change;

    if (newQuantity <= 0) {
      this.removeItem(item);
      return;
    }

    this.cartService.updateQuantity(item.id, newQuantity, this.userId!).subscribe({
      error: () => {
        this.toastr.error('Không thể cập nhật số lượng');
      }
    });
  }

  removeItem(item: CartItem) {
    if (!confirm(`Bạn có chắc muốn xóa "${item.productname}" khỏi giỏ hàng?`)) {
      return;
    }

    this.cartService.removeFromCart(item.id, this.userId!).subscribe({
      next: () => {
        this.toastr.success('Đã xóa sản phẩm khỏi giỏ hàng', 'Success');
      },
      error: (err) => {
        this.toastr.error('Không thể xóa sản phẩm', 'Error');
        console.error(err);
      }
    });
  }

  LoadingcartonNumber() {
    this.cartService.loadCartCount(this.userId!).subscribe();
  }

  proceedToCheckout() {
    if (this.cartService.items().length === 0) {
      this.toastr.warning('Giỏ hàng trống!', 'Warning');
      return;
    }

    // Navigate to checkout page
    this.router.navigate(['/checkout']);
  }

  continueShopping() {
    this.router.navigate(['/']);
  }
}