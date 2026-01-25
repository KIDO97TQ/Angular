import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent, LogoutData } from './shared/components/header/header';
import { CommonModule } from '@angular/common';
import { ProductService } from './Core/services/product';


@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App implements OnInit {
  user = signal({
    name: 'Kido',
    age: 28,
  })

  productService = inject(ProductService);
  products = signal<any[]>([]);

  selectedProduct = signal<any | null>(null);

  selectProduct(p: any) {
    this.selectedProduct.set(p);
  }

  ngOnInit() {
    this.productService.getProducts().subscribe({
      next: (res) => {
        this.products.set(res.products);
        this.productService.loading.set(false);
      },
      error: () => {
        this.productService.error.set('Lỗi load dữ liệu');
        this.productService.loading.set(false);
      }
    });
  }

  handleLongout(data: LogoutData) {
    alert(data.user);
    alert(data.time);
  }
}
