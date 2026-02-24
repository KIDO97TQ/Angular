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
import { ToastrService } from 'ngx-toastr';
import { ChangeDetectorRef } from '@angular/core';
import { usernameExistsValidator } from '../../../shared/validators/username-exists.validator';
import { CartsService } from '../../../Core/services/carts';
import { finalize } from 'rxjs/operators';

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
  toastr = inject(ToastrService);
  cd = inject(ChangeDetectorRef);
  cartService = inject(CartsService);

  isLoggedIn = false;
  username: string | null = null;
  isSignupMode = false;
  isLoginLoading = false;
  isSignupLoading = false;


  // LOGIN FORM
  formLogin = new FormGroup({
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
      validators: [Validators.required, Validators.minLength(3)],
      asyncValidators: [
        usernameExistsValidator(this.userService)
      ],
      updateOn: 'blur' //khuyên dùng
    }),
    phone: new FormControl<string>('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/^(\+84|0)(3|5|7|8|9)[0-9]{8}$/)
      ]
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
    if (this.formLogin.invalid || this.isLoginLoading) return;

    this.isLoginLoading = true;

    const { username, password } = this.formLogin.getRawValue();

    const payload = {
      user: username,
      pass: password
    };

    this.userService.login(payload)
      .pipe(
        finalize(() => {
          this.isLoginLoading = false;
        })
      )
      .subscribe({
        next: (res: any) => {
          this.username = res.user.username;
          this.formLogin.reset();

          this.authService.saveToken(res.token);
          this.authService.setUsername(res.user.username);
          this.authService.setUserID(res.user.id);
          this.authService.setUserPhone(res.user.userphone);
          this.authService.setUserdate(res.user.createdate);
          this.isLoggedIn = true;
          this.Loadingcart(res.user.id);

          this.router.navigate(['/']);
        },
        error: (ee) => {
          this.toastr.error(ee.error.message || 'Đăng nhập thất bại');
        }
      });
  }



  Loadingcart(userId: string) {
    if (userId) {
      this.cartService.loadCartCount(userId).subscribe();
    }
  }


  // SIGNUP SUBMIT
  submitSignup() {
    if (this.signupForm.invalid || this.isSignupLoading) return;

    this.isSignupLoading = true;

    const { username, phone, password } = this.signupForm.getRawValue();

    const payload = {
      user: username,
      phone: phone,
      pass: password
    };

    this.userService.signup(payload).subscribe({
      next: () => {
        this.isSignupLoading = false;

        this.signupForm.reset();
        this.isSignupMode = false;
        this.toastr.success('Đăng ký thành công. Vui lòng đăng nhập', 'Success');
      },
      error: (ee) => {
        this.isSignupLoading = false;
        alert(ee.error.message);
      }
    });
  }


  // LOGOUT
  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.cartService.resetCart();
    this.router.navigate(['/login']);
  }
}