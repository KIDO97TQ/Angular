import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AuthService } from '../../../Core/auth/auth-service';
import { UserService } from '../../../Core/services/user';

@Component({
  selector: 'app-mysetting',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mysetting.html',
  styleUrl: './mysetting.css',
})
export class MysettingComponent {
  authService = inject(AuthService);
  userService = inject(UserService);
  cd = inject(ChangeDetectorRef);

  theme = new FormControl<'light' | 'dark'>('light');
  showCurrent = false;
  showNew = false;
  showRenew = false;
  isCurrentPasswordValid = false;
  isChecking = false;
  isCurrentValid = false;

  togglePassword(field: 'current' | 'new' | 'renew') {
    if (field === 'current') this.showCurrent = !this.showCurrent;
    if (field === 'new') this.showNew = !this.showNew;
    if (field === 'renew') this.showRenew = !this.showRenew;
  }

  passwordForm = new FormGroup(
    {
      currentPassword: new FormControl('', Validators.required),
      newPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      renewPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
    },
    { validators: passwordMatchValidator() }
  );

  checkCurrentPassword() {
    const control = this.passwordForm.get('currentPassword');

    if (!control || !control.value) return;

    this.isChecking = true;

    this.userService.checkCurrentPassword(control.value).subscribe({
      next: (res) => {

        if (res.valid) {
          control.setErrors(null);
          this.isCurrentPasswordValid = true;
        } else {
          control.setErrors({ wrongPassword: true });
          this.isCurrentPasswordValid = false;
        }
        this.isChecking = false;
        this.cd.detectChanges();
      },
      error: () => {
        control.setErrors({ wrongPassword: true });
        this.isCurrentPasswordValid = false;
        this.isChecking = false;
      }
    });
  }

  toggleTheme() {
    const value = this.theme.value === 'light' ? 'dark' : 'light';
    this.theme.setValue(value);
    document.documentElement.setAttribute('data-theme', value!);
  }

  changePassword() {

    if (this.passwordForm.invalid || !this.isCurrentPasswordValid) {
      return;
    }

    const newPassword = this.passwordForm.value.newPassword!;

    this.userService.updatePassword(newPassword).subscribe({
      next: (res) => {

        alert('Đổi mật khẩu thành công!');

        // Reset form
        this.passwordForm.reset();

        // Reset trạng thái
        this.isCurrentPasswordValid = false;
        this.showCurrent = false;
        this.showNew = false;
        this.showRenew = false;

      },
      error: (err) => {
        alert(err.error?.message || 'Lỗi cập nhật mật khẩu');
      }
    });

  }

  logoutAll() {
    alert('Đã đăng xuất khỏi tất cả thiết bị');
  }

}

function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const newPassword = control.get('newPassword')?.value;
    const renewPassword = control.get('renewPassword')?.value;

    if (!newPassword || !renewPassword) return null;

    return newPassword === renewPassword
      ? null
      : { passwordMismatch: true };
  };
}
