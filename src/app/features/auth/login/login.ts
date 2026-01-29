// login.component.ts
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../Core/services/user';
import { AuthService } from '../../../Core/auth/auth-service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {

  router = inject(Router);
  userService = inject(UserService);
  authService = inject(AuthService);

  isLoggedIn = false;
  username: string | null = null;
  isSignupMode = false; // Toggle between login/signup

  // LOGIN FORM
  form = new FormGroup({
    username: new FormControl<string>('', {
      nonNullable: true,
      validators: Validators.required
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: Validators.required
    }),
  });

  // SIGNUP FORM
  signupForm = new FormGroup({
    username: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)]
    }),
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)]
    }),
  });

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.authService.user$.subscribe(name => {
      this.username = name;
    });
  }

  // Toggle between Login/Signup
  toggleMode() {
    this.isSignupMode = !this.isSignupMode;
  }

  // LOGIN SUBMIT
  submit() {
    if (this.form.invalid) return;
    const { username, password } = this.form.getRawValue();

    const payload = {
      user: username,
      pass: password
    };

    this.userService.login(payload).subscribe({
      next: (res: any) => {
        this.authService.saveToken(res.token);
        this.authService.setUsername(username);
        this.isLoggedIn = true;
        this.router.navigate(['/products']);
      },
      error: (ee) => {
        alert(ee.error.message);
      }
    });
  }

  // SIGNUP SUBMIT
  submitSignup() {
    if (this.signupForm.invalid) {
      alert('Please fill all fields correctly!');
      return;
    }

    const { username, email, password } = this.signupForm.getRawValue();

    const payload = {
      user: username,
      email: email,
      pass: password
    };

    this.userService.signup(payload).subscribe({
      next: (res: any) => {
        this.isSignupMode = false;
        this.isLoggedIn = true;
        alert('Signup successful! Please login.');
      },
      error: (ee) => {
        alert(ee.error.message);
      }
    });

    console.log('Signup payload:', payload);
  }

  // LOGOUT
  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }
}