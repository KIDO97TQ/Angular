import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    payments(payload: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/payment/create-payment`, payload);
    }

    checkStatusOrder(orderCode: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/payment/order-status`, { orderCode });
    }
}
