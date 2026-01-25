
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../../../Core/services/product';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductListComponent implements OnInit {

  productService = inject(ProductService);
  router = inject(Router);

  products = signal<any[]>([]);

  ngOnInit() {
    this.productService.getProducts().subscribe(res => {
      this.products.set(res.products);
      this.productService.loading.set(false);
    });
  }

  goDetail(p: any) {
    this.router.navigate(['/products', p.id]);
  }

  goCreate() {
    this.router.navigate(['/products/new']);
  }
}
