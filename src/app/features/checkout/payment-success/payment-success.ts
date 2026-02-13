import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../../Core//services/payment';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h2 *ngIf="loading">Đang kiểm tra thanh toán...</h2>

      <h2 *ngIf="status === 'paid'" style="color:green">
        ✅ Thanh toán thành công!
      </h2>

      <h2 *ngIf="status === 'pending'" style="color:orange">
        ⏳ Đang chờ xác nhận thanh toán...
      </h2>

      <h2 *ngIf="status === 'failed'" style="color:red">
        ❌ Thanh toán thất bại
      </h2>
    </div>
  `
})
export class PaymentSuccessComponent implements OnInit {

  route = inject(ActivatedRoute);
  PaymentService = inject(PaymentService);

  status: string = '';
  loading = true;
  intervalId: any;
  orderCode!: string;

  ngOnInit() {
    const code = this.route.snapshot.queryParamMap.get('orderCode');

    if (!code) {
      this.loading = false;
      return;
    }

    this.orderCode = code;

    // Check lần đầu
    this.checkOrder();

    // 🔥 Tự động check mỗi 3 giây
    this.intervalId = setInterval(() => {
      if (this.status !== 'paid') {
        this.checkOrder();
      }
    }, 3000);
  }

  checkOrder() {
    this.PaymentService.payments(this.orderCode)
      .subscribe({
        next: (res) => {
          this.status = res.status;
          this.loading = false;

          // Nếu đã paid thì dừng interval
          if (this.status === 'paid') {
            clearInterval(this.intervalId);
          }
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  ngOnDestroy() {
    // Quan trọng: tránh memory leak
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}


