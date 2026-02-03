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

  isLoggedIn = false;
  username: string | null = null;
  isSignupMode = false; // Toggle between login/signup

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
    if (this.formLogin.invalid) return;
    const { username, password } = this.formLogin.getRawValue();

    const payload = {
      user: username,
      pass: password
    };

    this.userService.login(payload).subscribe({
      next: (res: any) => {
        console.log('LOGIN RESPONSE:', res);
        this.username = res.user.username;
        this.formLogin.reset();
        this.authService.saveToken(res.token);
        this.authService.setUsername(res.user.username);
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
      alert('Vui lòng điền các thông tin chính xác!');
      return;
    }

    const { username, phone, password } = this.signupForm.getRawValue();

    const payload = {
      user: username,
      phone: phone,
      pass: password
    };
    console.log(payload);

    this.userService.signup(payload).subscribe({
      next: (res: any) => {
        this.signupForm.reset();
        this.isSignupMode = false;
        this.isLoggedIn = false;
        this.cd.detectChanges(); //thêm để hết lỗi Angular đã check xong view rồi, nhưng giá trị bind lại bị đổi ngay sau đó
        this.toastr.success('Đăng ký thành công. Vui lòng đăng nhập', 'Success');
      },
      error: (ee) => {
        alert(ee.error.message);
      }
    });
  }

  // LOGOUT
  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }
}