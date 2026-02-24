import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment'
import { tap } from 'rxjs/operators';

export interface OrderItem {
    order_id: number;
    productid: number;
    productname: string;
    price: number;
    rental_days: number;
    subtotal: number;
    quantity: number;
    imageUrl?: string;
    created_at: string;
}

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private apiUrl = environment.apiUrl;
    private OrderItems = signal<OrderItem[]>([]);
    constructor(private http: HttpClient) { }
    private cartCountSubject = new BehaviorSubject<number>(0);
    cartCount$ = this.cartCountSubject.asObservable();

    // detail carts
    items = computed(() => this.OrderItems());
    totalItems = computed(() => this.OrderItems().reduce((sum, item) => sum + item.quantity, 0));

    getOrdertById(Id: string): Observable<OrderItem[]> {
        return this.http.get<OrderItem[]>(`${this.apiUrl}/order/order-detail/${Id}`).pipe(
            tap(items => {
                const itemsWithImages = items.map(item => ({
                    ...item,
                    imageUrl: `https://raw.githubusercontent.com/kido1997/ImageLuongEm/main/ImageLuongEm/${item.productid}.jpg`
                }));
                this.OrderItems.set(itemsWithImages);
            })
        );
    }

    getUserRentals(): Observable<any> {
        return this.http.get(`${this.apiUrl}/order/rentals/`);
    }

    getOrderQTY(Id: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/order/order-qty/${Id}`);
    }
}
