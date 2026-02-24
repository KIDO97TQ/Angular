import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private userSubject = new BehaviorSubject<string | null>(null);
  private userphoneSubject = new BehaviorSubject<string | null>(null);
  private userdateSubject = new BehaviorSubject<string | null>(null);
  user$ = this.userSubject.asObservable();
  userphone$ = this.userphoneSubject.asObservable();
  userdate$ = this.userdateSubject.asObservable();

  setUsername(username: string) {
    this.userSubject.next(username);
    localStorage.setItem('username', username);
  }

  setUserID(userID: string) {
    localStorage.setItem('userID', userID);
  }

  setUserPhone(userphone: string) {
    this.userphoneSubject.next(userphone);
    localStorage.setItem('userphone', userphone);
  }
  setUserdate(userdate: string) {
    this.userdateSubject.next(userdate);
    localStorage.setItem('userdate', userdate);
  }
  loadUserFromStorage() {
    const username = localStorage.getItem('username');
    if (username) {
      this.userSubject.next(username);
    }
    const userphone = localStorage.getItem('userphone');
    if (userphone) {
      this.userphoneSubject.next(userphone);
    }
    const userdate = localStorage.getItem('userdate');
    if (userdate) {
      this.userdateSubject.next(userdate);
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
    localStorage.removeItem('userID');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userdate');
    this.userSubject.next(null)
  }


}
