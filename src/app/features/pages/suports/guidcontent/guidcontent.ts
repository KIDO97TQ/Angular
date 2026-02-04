import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router'
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-guidcontent',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './guidcontent.html',
  styleUrl: './guidcontent.css',
})
export class Guidcontent {

}
