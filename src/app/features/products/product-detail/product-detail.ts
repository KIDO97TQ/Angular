import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../Core/services/product';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.html',
})
export class ProductDetailComponent implements OnInit {

  route = inject(ActivatedRoute);
  productService = inject(ProductService);

  product = signal<any | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    this.productService
      .getProductById(id)
      .subscribe(res => this.product.set(res));
  }
}

