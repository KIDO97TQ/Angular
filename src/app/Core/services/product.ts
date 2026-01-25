import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private api = 'https://dummyjson.com/products';

  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private http: HttpClient) { }

  getProducts() {
    this.loading.set(true);
    this.error.set(null);
    return this.http.get<any>(this.api);
  }

  getProductById(id: string | null) {
    this.loading.set(true);
    this.error.set(null);
    return this.http.get<any>(`${this.api}/${id}`);
  }

}
