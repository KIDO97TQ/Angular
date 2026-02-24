import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../../Core/services/payment';
import { RouterModule } from '@angular/router';
import { CartsService } from '../../../Core/services/carts';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-success.html',
  styleUrls: ['./payment-success.css'],
})
export class PaymentSuccessComponent implements OnInit, OnDestroy {
  cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private paymentService = inject(PaymentService);
  cartService = inject(CartsService);

  status: 'paid' | 'pending' | 'failed' | 'expired' | '' = '';
  loading = true;
  intervalId: any;
  orderCode!: string;

  ngOnInit() {
    const code = this.route.snapshot.queryParamMap.get('orderCode');

    if (!code) {
      this.status = 'failed';
      this.loading = false;
      return;
    }

    this.orderCode = code;

    this.startPolling();
  }

  startPolling() {
    this.checkOrder();

    this.intervalId = setInterval(() => {
      if (this.status !== 'paid') {
        this.checkOrder();
      } else {
        clearInterval(this.intervalId);
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
            this.cartService.loadCartCount(res.user_id).subscribe();
            this.cdr.detectChanges();
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
