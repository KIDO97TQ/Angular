import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-mysetting',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mysetting.html',
  styleUrl: './mysetting.css',
})
export class MysettingComponent {
  theme = new FormControl<'light' | 'dark'>('light');

  passwordForm = new FormGroup({
    currentPassword: new FormControl('', Validators.required),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  toggleTheme() {
    const value = this.theme.value === 'light' ? 'dark' : 'light';
    this.theme.setValue(value);
    document.documentElement.setAttribute('data-theme', value!);
  }

  changePassword() {
    if (this.passwordForm.invalid) return;
    console.log(this.passwordForm.value);
    alert('Đổi mật khẩu thành công!');
    this.passwordForm.reset();
  }

  logoutAll() {
    alert('Đã đăng xuất khỏi tất cả thiết bị');
  }
}
