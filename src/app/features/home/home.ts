import { Component } from '@angular/core';
import { HeroSliderComponent } from './sections/hero-slider/hero-slider'
import { IntroComponent } from './sections/intro/intro'
import { FeaturedProductsComponent } from './sections/featured-products/featured-products'
import { CTAComponent } from './sections/testimonials/testimonials'


@Component({
  selector: 'app-home',
  imports: [HeroSliderComponent, IntroComponent, FeaturedProductsComponent, CTAComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent {

}
