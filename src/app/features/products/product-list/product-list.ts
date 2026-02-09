import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../Core/services/product';
import { Subscription } from 'rxjs';
import { registerLocaleData } from '@angular/common';
import { CartsService } from '../../../Core/services/carts';
import { AuthService } from '../../../Core/auth/auth-service';
import { ToastrService } from 'ngx-toastr';


export interface Product {
  id: number;
  productname: string;
  productprice: number;
  productsize: string;
  stockquantity: number;
  saveqty: number;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductListComponent implements OnDestroy {
  CartsService = inject(CartsService);
  authService = inject(AuthService);
  toastr = inject(ToastrService);

  private readonly TYPE_TITLE_MAP: Record<string, string> = {
    'ao-dai': 'Áo dài',
    'vay-ngan': 'Váy ngắn',
    'vay-dai': 'Váy dài',
    'chan-vay': 'Chân váy',
    'vay-tiec-chieu': 'Váy tiệc chiều',
    'giay': 'Giày'
  };

  productService = inject(ProductService);
  router = inject(Router);

  title = '';
  type = '';
  userId: string = '';
  products: Product[] = [];
  sub!: Subscription;

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;
  paginatedProducts: Product[] = [];

  // Expose Math to template
  Math = Math;

  constructor(
    private route: ActivatedRoute
  ) {
    this.sub = this.route.params.subscribe(params => {
      this.type = params['type'];
      console.log(this.type);
      this.title = this.TYPE_TITLE_MAP[this.type] ?? '';
      this.fetchProducts();
    });
  }

  fetchProducts() {
    this.productService.GetProductByType(this.type).subscribe(res => {
      this.products = res;
      this.products = this.products.map(p => ({
        ...p,
        productprice: Number(
          String(p.productprice).replace(/[.,]/g, '')
        )
      }));
      this.calculatePagination();
      this.productService.loading.set(false);
    });
  }

  calculatePagination() {
    this.totalPages = Math.ceil(this.products.length / this.itemsPerPage);
    this.updatePaginatedProducts();
  }

  updatePaginatedProducts() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedProducts = this.products.slice(startIndex, endIndex);

    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedProducts();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedProducts();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedProducts();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;

    if (this.totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages with ellipsis
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push(-1); // -1 represents ellipsis
        pages.push(this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        pages.push(1);
        pages.push(-1);
        for (let i = this.totalPages - 3; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push(-1);
        pages.push(this.totalPages);
      }
    }

    return pages;
  }

  // Helper method to get end index for display
  getEndIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.products.length);
  }

  // Helper method to get start index for display
  getStartIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  addToCart(item: any) {
    console.log('CLICKED', item);

    if (!this.authService.isLoggedIn()) {
      this.toastr.error('Bạn cần đăng nhập trước mới có thể mua hàng', 'Error');
      this.router.navigate(['/login'], {
        queryParams: {
          returnUrl: this.router.url
        }
      });
      return;
    }

    this.userId = this.authService.getUserId()!;
    this.CartsService.addToCart(this.userId, item).subscribe({
      next: () => {
        this.toastr.success('Đã thêm vào giỏ hàng', 'Success');
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Lỗi thêm giỏ hàng', 'Error');
      }
    });
  }
}