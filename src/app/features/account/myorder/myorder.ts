import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Rental {
  id: number;
  name: string;
  image: string;
  startDate: string;
  endDate: string;
  price: number;
  status: 'active' | 'returned' | 'overdue' | 'cancelled';
  daysRemaining?: number;
}

@Component({
  selector: 'app-myorder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './myorder.html',
  styleUrl: './myorder.css',
})
export class MyorderComponent implements OnInit {
  activeTab: 'current' | 'history' = 'current';
  searchTerm: string = '';
  sortBy: 'date' | 'price' | 'name' = 'date';

  rentals: Rental[] = [
    {
      id: 1,
      name: 'Váy dài lụa cao cấp',
      image: 'assets/products/dress1.jpg',
      startDate: '2024-02-08',
      endDate: '2024-02-15',
      price: 500000,
      status: 'active',
      daysRemaining: 5
    },
    {
      id: 2,
      name: 'Áo dài truyền thống',
      image: 'assets/products/aodai.jpg',
      startDate: '2024-02-01',
      endDate: '2024-02-10',
      price: 800000,
      status: 'overdue',
      daysRemaining: -1
    },
    {
      id: 3,
      name: 'Váy tiệc sang trọng',
      image: 'assets/products/party-dress.jpg',
      startDate: '2024-01-15',
      endDate: '2024-01-20',
      price: 1200000,
      status: 'returned'
    },
    {
      id: 4,
      name: 'Chân váy công sở',
      image: 'assets/products/skirt.jpg',
      startDate: '2024-01-10',
      endDate: '2024-01-12',
      price: 300000,
      status: 'cancelled'
    }
  ];

  ngOnInit() {
    this.updateDaysRemaining();
    // Update countdown every day
    setInterval(() => this.updateDaysRemaining(), 86400000);
  }

  updateDaysRemaining() {
    const today = new Date();
    this.rentals.forEach(rental => {
      if (rental.status === 'active' || rental.status === 'overdue') {
        const endDate = new Date(rental.endDate);
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        rental.daysRemaining = diffDays;

        // Auto-update status if overdue
        if (diffDays < 0 && rental.status === 'active') {
          rental.status = 'overdue';
        }
      }
    });
  }

  get filteredRentals() {
    let filtered = this.rentals;

    // Filter by tab
    if (this.activeTab === 'current') {
      filtered = filtered.filter(r =>
        r.status === 'active' || r.status === 'overdue'
      );
    } else {
      filtered = filtered.filter(r =>
        r.status === 'returned' || r.status === 'cancelled'
      );
    }

    // Filter by search term
    if (this.searchTerm) {
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Sort
    return this.sortRentals(filtered);
  }

  sortRentals(rentals: Rental[]): Rental[] {
    return [...rentals].sort((a, b) => {
      switch (this.sortBy) {
        case 'date':
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        case 'price':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }

  get currentCount() {
    return this.rentals.filter(r =>
      r.status === 'active' || r.status === 'overdue'
    ).length;
  }

  get historyCount() {
    return this.rentals.filter(r =>
      r.status === 'returned' || r.status === 'cancelled'
    ).length;
  }

  setTab(tab: 'current' | 'history') {
    this.activeTab = tab;
  }

  getStatusLabel(status: string) {
    return {
      active: 'Đang thuê',
      overdue: 'Quá hạn',
      returned: 'Đã trả',
      cancelled: 'Đã huỷ'
    }[status];
  }

  extendRental(id: number) {
    console.log('Gia hạn đơn:', id);
    // Implement extend logic
  }

  cancelRental(id: number) {
    if (confirm('Bạn có chắc muốn huỷ đơn này?')) {
      const rental = this.rentals.find(r => r.id === id);
      if (rental) {
        rental.status = 'cancelled';
      }
    }
  }

  reviewRental(id: number) {
    console.log('Đánh giá đơn:', id);
    // Navigate to review page
  }

  getDaysRemainingText(rental: Rental): string {
    if (!rental.daysRemaining) return '';

    if (rental.daysRemaining < 0) {
      return `Quá hạn ${Math.abs(rental.daysRemaining)} ngày`;
    } else if (rental.daysRemaining === 0) {
      return 'Hết hạn hôm nay';
    } else {
      return `Còn ${rental.daysRemaining} ngày`;
    }
  }
}