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
      `${this.apiUrl}/products/get-product-by-type/${type}`
    );
  }
}
