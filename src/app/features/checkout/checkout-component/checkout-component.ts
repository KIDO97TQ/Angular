import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CartsService } from '../../../Core/services/carts';
import { PaymentService } from '../../../Core//services/payment';
import { Router } from '@angular/router';

interface CartItem {
  id: number;
  productid: number;
  productname: string;
  productprice: number;
  quantity: number;
  imageUrl?: string;
}

@Component({
  selector: 'app-checkout-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout-component.html',
  styleUrl: './checkout-component.css',
})
export class CheckoutComponent implements OnInit {
  fb = inject(FormBuilder);
  cartService = inject(CartsService);
  PaymentService = inject(PaymentService);
  router = inject(Router);
  cartItems: CartItem[] = [];
  isLoading = false;

  username = localStorage.getItem('username');
  userPhone = localStorage.getItem('userphone');
  userid = localStorage.getItem('userID');

  checkoutForm = this.fb.group({
    fullname: [this.username, Validators.required],
    phone: [this.userPhone, Validators.required],
    rentDate: [this.getToday(), Validators.required],
    returnDate: ['', Validators.required]
  });

  today = this.getToday();

  getToday(): string {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - offset * 60000);
    return localDate.toISOString().split('T')[0];
  }

  ngOnInit() {
    this.cartItems = this.cartService.selectedItems();

    if (this.cartItems.length === 0) {
      alert('Bạn chưa chọn sản phẩm nào');
      this.router.navigate(['/cart']);
    }
  }

  // ===== TÍNH SỐ NGÀY =====
  get rentalDays(): number {
    const rent = this.checkoutForm.value.rentDate;
    const ret = this.checkoutForm.value.returnDate;

    if (!rent || !ret) return 0;

    const start = new Date(rent);
    const end = new Date(ret);

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 ? diff + 1 : 0;

  }

  // ===== TÍNH TIỀN =====
  get subtotal(): number {
    return this.cartItems.reduce(
      (sum, item) => sum + item.productprice * item.quantity,
      0
    );
  }

  get totalmoney(): number {
    return this.cartItems.reduce(
      (sum, item) => sum + item.productprice * item.quantity * this.rentalDays,
      0
    );
  }

  // ===== TẠO QR =====
  // generateQR() {

  //   if (this.checkoutForm.invalid || this.rentalDays <= 0) {
  //     this.qrUrl = null;
  //     return;
  //   }

  //   // Chỉ tạo orderCode 1 lần
  //   if (!this.orderCode) {
  //     this.orderCode = 'ORDER_' + Date.now();
  //   }

  //   this.qrUrl =
  //     `https://img.vietqr.io/image/MB-123456789-compact.png` +
  //     `?amount=${this.cartService.depositAmount()}` +
  //     `&addInfo=${this.orderCode}`;
  // }

  // ===== CONFIRM =====
  createDepositPayment() {

    if (this.isLoading) return; // 🔥 chặn double click

    if (this.checkoutForm.invalid || this.rentalDays <= 0) {
      alert('Vui lòng nhập đầy đủ thông tin và chọn ngày hợp lệ');
      return;
    }

    if (!this.userid) {
      alert("Vui lòng đăng nhập");
      return;
    }

    this.isLoading = true; // 🔥 bật loading

    const payload = {
      userId: this.userid,
      totalAmount: this.totalmoney,
      depositAmount: this.cartService.depositAmount(),
      items: this.cartItems.map(item => ({
        product_id: item.productid,
        quantity: item.quantity,
        price: item.productprice,
        rental_days: this.rentalDays,
        productname: item.productname
      }))
    };

    this.PaymentService.payments(payload).subscribe({
      next: (res: any) => {
        window.location.href = res.checkoutUrl;
      },
      error: (err) => {
        console.error(err);
        alert("Có lỗi khi tạo thanh toán");
        this.isLoading = false;
        this.router.navigate(['/cart']);
      }
    });
  }

}
