import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { OrderService, OrderItem } from '../../../../Core/services/order';
import { ToastrService } from 'ngx-toastr';
import { ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription, combineLatest } from 'rxjs';

@Component({
  selector: 'app-carts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.css',
})

export class OrderComponent {
  OrderService = inject(OrderService);
  router = inject(Router);
  toastr = inject(ToastrService);
  cd = inject(ChangeDetectorRef);
  sub!: Subscription;

  isLoading = true;
  orderID = "";

  constructor(
    private route: ActivatedRoute
  ) {
    this.sub = combineLatest([
      this.route.params,
      this.route.queryParams
    ]).subscribe(([params, query]) => {
      const id = query['id'];
      this.orderID = query['orderid'];

      this.OrderService.getOrdertById(id).subscribe({
        next: () => {
          this.isLoading = false;
          this.cd.detectChanges();
        },
        error: (err) => {
          this.isLoading = false;
          this.cd.detectChanges();
          this.toastr.error('Không thể đơn', 'Error');
          console.error(err);
        }
      });

    });
  }

  continueShopping() {
    this.router.navigate(['/myorder']);
  }
}