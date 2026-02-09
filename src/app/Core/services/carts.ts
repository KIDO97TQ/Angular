import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment'
import { tap } from 'rxjs/operators';

export interface CartItem {
  id: number;
  userid: string;
  productid: number;
  productname: string;
  productprice: number;
  productsize: string;
  quantity: number;
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartsService {
  private apiUrl = environment.apiUrl;
  private cartItems = signal<CartItem[]>([]);
  constructor(private http: HttpClient) { }
  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  resetCart() {
    this.cartCountSubject.next(0);
    this.cartItems.set([]);
  }

  /** Load cart count */
  loadCartCount(userId: string): Observable<{ count: number }> {
    return this.http
      .get<{ count: number }>(`${this.apiUrl}/carts/count/${userId}`)
      .pipe(
        tap(res => {
          this.cartCountSubject.next(res.count);
        })
      );
  }

  /** add carts */
  addToCart(userId: string, product: any) {
    return this.http.post(`${this.apiUrl}/carts/addcarts/${userId}`, {
      productId: product.id,
      price: product.productprice,
      rentalDays: 1
    }).pipe(
      tap(() => {
        this.loadCartCount(userId).subscribe();
      }));
  }

  // detail carts
  items = computed(() => this.cartItems());
  totalItems = computed(() => this.cartItems().reduce((sum, item) => sum + item.quantity, 0));
  depositAmount = computed(() => this.cartItems().length * 100000);
  totalRentPrice = computed(() => this.cartItems().reduce((sum, item) => sum + (item.productprice * item.quantity), 0));

  getCartByUserId(userId: string): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(`${this.apiUrl}/carts/users/${userId}`).pipe(
      tap(items => {
        const itemsWithImages = items.map(item => ({
          ...item,
          imageUrl: `https://raw.githubusercontent.com/kido1997/ImageLuongEm/main/ImageLuongEm/${item.productid}.jpg`
        }));
        this.cartItems.set(itemsWithImages);
      })
    );
  }

  updateQuantity(cartId: number, quantity: number, userId: string): Observable<any> {
    return this.http
      .put(`${this.apiUrl}/carts/cart-items/${cartId}`, { quantity })
      .pipe(
        tap(() => {
          // update local cart items
          this.cartItems.update(items =>
            items.map(item =>
              item.id === cartId ? { ...item, quantity } : item
            )
          );
          this.loadCartCount(userId).subscribe();
        })
      );
  }


  removeFromCart(cartId: number, userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/carts/cart-items/${cartId}`).pipe(
      tap(() => {
        // Update local state
        this.cartItems.update(items => items.filter(item => item.id !== cartId)); this.loadCartCount(userId).subscribe();
      })
    );
  }

  clearCart(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/carts/user/${userId}`).pipe(
      tap(() => {
        this.cartItems.set([]); this.loadCartCount(userId).subscribe();
      })
    );
  }
}
