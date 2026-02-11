import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'
import { Observable } from 'rxjs';

export interface Product {
  id: number;
  productname: string;
  productprice: number;
  productsize: string;
  stockquantity: number;
  saveqty: number;
}

@Injectable({
  providedIn: 'root'
})

export class ProductService {
  constructor(private http: HttpClient) { }
  private apiUrl = environment.apiUrl;

  loading = signal(false);
  error = signal<string | null>(null);


  GetProductByType(type: string) {
    return this.http.get<Product[]>(
      `${this.apiUrl}/products/get-product-by-type/bytype`,
      { params: { type } }
    );
  }
  searchProducts(keyword: string) {
    return this.http.get<Product[]>(
      `${this.apiUrl}/products/get-product-by-type/search`,
      { params: { keyword } }
    );
  }

  getAllProducts() {
    return this.http.get<Product[]>(
      `${this.apiUrl}/products/get-product-by-type/all`
    );
  }

  getAllProductsType() {
    return this.http.get<any[]>(`${this.apiUrl}/products/get-product-by-type/alltype`);
  }
}
