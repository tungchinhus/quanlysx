import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-components',
  templateUrl: './components.component.html',
  styleUrls: ['./components.component.scss']
})
export class ComponentsComponent implements OnInit {
  message: string = 'Welcome to Quản lý sản xuất';
  panelOpenState = false;
  canRenderCarousel: boolean = false;

  constructor() {}

  ngOnInit(): void {
    setTimeout(() => {
      this.canRenderCarousel = true;
    });
  }
}
