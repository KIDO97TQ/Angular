import { Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.html',
})
export class ProductFormComponent {

  form = new FormGroup({
    title: new FormControl('', Validators.required),
    price: new FormControl(0, [
      Validators.required,
      Validators.min(1)
    ]),
    description: new FormControl(''),
  });

  submit() {
    if (this.form.invalid) return;

    console.log(this.form.value);
  }
}
