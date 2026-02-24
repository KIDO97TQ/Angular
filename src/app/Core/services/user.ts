import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  login(data: { user: string; pass: string }) {
    return this.http.post(`${this.apiUrl}/auth/login`, data);
  }

  // Method signup
  signup(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/signup`, payload);
  }

  // Check username có tồn tại không
  checkUsername(username: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/check-username/${username}`);
  }

  // check mật khẩu cũ
  checkCurrentPassword(currentPassword: string) {
    return this.http.post<any>(`${this.apiUrl}/auth/check-password`,
      { currentPassword }
    );
  }

  // update mật khẩu
  updatePassword(newPassword: string) {
    return this.http.put<any>(`${this.apiUrl}/auth/update-password`,
      { newPassword }
    );
  }
}
