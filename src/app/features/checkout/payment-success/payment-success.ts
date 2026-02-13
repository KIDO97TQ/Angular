import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../../Core/services/payment';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-success.html',
  styleUrls: ['./payment-success.css'],
})
export class PaymentSuccessComponent implements OnInit, OnDestroy {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private paymentService = inject(PaymentService);

  status: 'paid' | 'pending' | 'failed' | '' = '';
  loading = true;
  intervalId: any;
  orderCode!: string;

  ngOnInit() {
    const code = this.route.snapshot.queryParamMap.get('orderCode');

    if (!code) {
      this.loading = false;
      this.status = 'failed';
      return;
    }

    this.orderCode = code;

    // Check lần đầu
    this.checkOrder();

    // Auto check mỗi 3 giây
    this.intervalId = setInterval(() => {
      if (this.status !== 'paid') {
        this.checkOrder();
      }
    }, 3000);
  }

  checkOrder() {
    this.paymentService.checkStatusOrder(this.orderCode)
      .subscribe({
        next: (res) => {
          this.status = res.status;
          this.loading = false;

          if (this.status === 'paid') {
            clearInterval(this.intervalId);

            // 🔥 Tự động redirect sau 5s (tuỳ chọn)
            setTimeout(() => {
              this.router.navigate(['/']);
            }, 5000);
          }
        },
        error: () => {
          this.loading = false;
          this.status = 'failed';
        }
      });
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
