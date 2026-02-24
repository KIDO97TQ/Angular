import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../../Core/auth/auth-service';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../Core/services/order';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent {
  authService = inject(AuthService);
  orderService = inject(OrderService);
  cd = inject(ChangeDetectorRef);

  alldata: any[] = [];
  totalRentals = 0;
  rank: any;
  maxDate: any;

  ngOnInit() {

    const id = this.authService.getUserId()!;

    this.orderService.getOrderQTY(id).subscribe({
      next: (res) => {

        this.alldata = res;
        this.totalRentals = res.length;
        this.rank = this.getMemberRank(this.totalRentals);
        this.maxDate = new Date(
          Math.max(...this.alldata.map(item => new Date(item.created_at).getTime()))
        );
        this.cd.detectChanges();
      },
      error: () => {
        console.log('Không thể tải đơn hàng');
      }
    });
  }

  getMemberRank(total: number) {
    if (total >= 60) {
      return { name: 'Kim cương', icon: 'bi-gem', color: '#38bdf8', next: null };
    }
    if (total >= 30) {
      return { name: 'Vàng', icon: 'bi-award-fill', color: '#facc15', next: 60 };
    }
    if (total >= 10) {
      return { name: 'Bạc', icon: 'bi-award', color: '#cddaee', next: 30 };
    }
    return { name: 'Đồng', icon: 'bi-shield', color: '#d97706', next: 10 };
  }
}
