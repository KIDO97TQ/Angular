import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-hero-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-slider.html',
  styleUrls: ['./hero-slider.css'],
})

export class HeroSliderComponent implements OnInit, OnDestroy {
  slides = [
    {
      image: 'assets/images/anh1.jpg',
      title: 'AMY – Đến là đẹp',
      description: 'Thuê váy xinh cho mọi khoảnh khắc'
    },
    {
      image: 'assets/images/anh5.jpg',
      title: 'Tỏa sáng theo cách của bạn',
      description: 'Đầm váy sang trọng – dễ lựa chọn'
    },
    {
      image: 'assets/images/anh4.jpg',
      title: 'Trải nghiệm thử đồ trực tiếp',
      description: 'Chỉ cần đến AMY – mọi thứ đã sẵn sàng'
    }
  ];

  currentIndex = 0;
  intervalId!: number;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.intervalId = window.setInterval(() => {
      this.nextSlide();
      this.cdr.detectChanges();
    }, 8000);
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  nextSlide() {
    this.currentIndex =
      (this.currentIndex + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentIndex =
      (this.currentIndex - 1 + this.slides.length) %
      this.slides.length;
  }
}
