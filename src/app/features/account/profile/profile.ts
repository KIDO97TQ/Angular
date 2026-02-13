import { Component } from '@angular/core';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent {
  user = {
    username: 'LuongEm',
    phone: '0988424735',
    joinedAt: '2024-05-12',
    totalRentals: 120
  };

  rank = this.getMemberRank(this.user.totalRentals);

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
