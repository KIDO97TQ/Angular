import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router'
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class FooterComponent {

}
