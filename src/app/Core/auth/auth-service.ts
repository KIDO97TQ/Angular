import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private userSubject = new BehaviorSubject<string | null>(null);
  user$ = this.userSubject.asObservable();

  setUsername(username: string) {
    this.userSubject.next(username);
    localStorage.setItem('username', username);
  }

  setUserID(userID: string) {
    localStorage.setItem('userID', userID);
  }

  loadUserFromStorage() {
    const username = localStorage.getItem('username');
    if (username) {
      this.userSubject.next(username);
    }
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }
  getUserId() {
    return localStorage.getItem('userID');
  }
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    this.userSubject.next(null)
  }
}
