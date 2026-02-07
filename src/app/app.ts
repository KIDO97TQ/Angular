import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header';
import { FooterComponent } from './shared/components/footer/footer';
import { CommonModule } from '@angular/common';
import { ProductService } from './Core/services/product';
import { AuthService } from '../app/Core/auth/auth-service';


@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, CommonModule, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App implements OnInit {

  constructor(private authService: AuthService) {
    this.authService.loadUserFromStorage();
  }

  productService = inject(ProductService);
  products = signal<any[]>([]);

  selectedProduct = signal<any | null>(null);

  selectProduct(p: any) {
    this.selectedProduct.set(p);
  }

  ngOnInit() {
    // this.productService.getProducts().subscribe({
    //   next: (res) => {
    //     this.products.set(res.products);
    //     this.productService.loading.set(false);
    //   },
    //   error: () => {
    //     this.productService.error.set('Lỗi load dữ liệu');
    //     this.productService.loading.set(false);
    //   }
    // });
  }

}
