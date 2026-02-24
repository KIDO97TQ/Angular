import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../Core/services/order';
import { ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

interface Rental {
  id: number;
  order_code: string;
  total_amount: number;
  deposit_amount: number;
  startdate: string;
  status: string;
  checkout_url: string;
}

@Component({
  selector: 'app-myorder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './myorder.html',
  styleUrl: './myorder.css',
})
export class MyorderComponent implements OnInit {
  orderService = inject(OrderService);
  cd = inject(ChangeDetectorRef);
  router = inject(Router);

  activeTab: 'pending' | 'history' = 'pending';
  searchTerm: string = '';
  sortBy: 'date' | 'price' | 'name' = 'date';

  rentals: Rental[] = [];
  loading = false;
  error = '';

  ngOnInit() {
    this.loading = true;

    this.orderService.getUserRentals().subscribe({
      next: (res) => {
        this.rentals = Array.isArray(res) ? res : res.data || [];
        this.loading = false;
        this.cd.detectChanges();
        console.log(this.rentals);
      },
      error: (err) => {
        this.error = 'Không thể tải đơn hàng';
        this.loading = false;
      }
    });
  }

  /* ================= FILTER ================= */

  get filteredRentals() {
    let filtered = this.rentals;

    if (this.activeTab === 'pending') {
      filtered = filtered.filter(r => r.status === 'pending');
    } else {
      filtered = filtered.filter(r =>
        r.status === 'paid' || r.status === 'expired'
      );
    }

    if (this.searchTerm) {
      filtered = filtered.filter(r =>
        r.order_code.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    return this.sortRentals(filtered);
  }

  sortRentals(rentals: Rental[]): Rental[] {
    return [...rentals].sort((a, b) => {
      switch (this.sortBy) {
        case 'date':
          return new Date(b.startdate).getTime() - new Date(a.startdate).getTime();
        case 'price':
          return b.total_amount - a.total_amount;
        case 'name':
          return a.order_code.localeCompare(b.order_code);
        default:
          return 0;
      }
    });
  }

  /* ================= COUNT ================= */

  get currentCount() {
    return this.rentals.filter(r => r.status === 'pending').length;
  }

  get historyCount() {
    return this.rentals.filter(r =>
      r.status === 'paid' || r.status === 'expired'
    ).length;
  }

  setTab(tab: 'pending' | 'history') {
    this.activeTab = tab;
  }

  /* ================= ACTIONS ================= */

  viewDetail(id: number, orderid: string) {
    //console.log('Xem chi tiết đơn:', id);
    this.router.navigate(['/order-detail'], {
      queryParams: { id, orderid }
    });
  }

  payRental(order: Rental) {
    window.location.href = order.checkout_url;
    console.log(order.checkout_url);
  }

  buyAgain(id: number) {
    console.log('Mua lại đơn:', id);
    // Điều hướng về trang sản phẩm
  }

  getStatusLabel(status: string) {
    return {
      pending: 'Chờ thanh toán',
      paid: 'Đã thanh toán',
      expired: 'Đã hết hạn'
    }[status];
  }
}