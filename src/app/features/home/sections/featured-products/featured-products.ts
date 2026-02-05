import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-featured-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './featured-products.html',
  styleUrl: './featured-products.css',
})
export class FeaturedProductsComponent implements OnInit, OnDestroy {
  constructor(private cdr: ChangeDetectorRef) { }
  imagesLeft = [
    'assets/images/anh1.jpg',
    'assets/images/anh2.jpg',
    'assets/images/anh3.jpg'
  ];

  imagesRight = [
    'assets/images/anh4.jpg',
    'assets/images/anh5.jpg',
    'assets/images/anh2.jpg',
    'assets/images/anh3.jpg'
  ];

  currentLeft = 0;
  currentRight = 0;

  intervalId!: number;
  timeoutId!: number;

  ngOnInit() {
    this.intervalId = window.setInterval(() => {

      // ảnh trái đổi trước
      this.currentLeft =
        (this.currentLeft + 1) % this.imagesLeft.length;
      this.cdr.detectChanges();

      // ảnh phải đổi sau 1.5s
      this.timeoutId = window.setTimeout(() => {
        this.currentRight =
          (this.currentRight + 1) % this.imagesRight.length;
        this.cdr.detectChanges();
      }, 1500);

    }, 5000);
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
    clearTimeout(this.timeoutId);
  }
}
