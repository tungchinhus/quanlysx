import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { OwlOptions, SlidesOutputData } from 'ngx-owl-carousel-o';
import { BIC_SLIDER, CI_SLIDER } from './slider-content-data-model';
// import sitemap from 'src/environments/sitemap.json';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss']
})
export class SliderComponent implements OnInit {
  @ViewChild('sliderComponent') sliderComponent: any;
  @Input() canRender!: boolean;

  productCISlider = CI_SLIDER;
  productBICSlider = BIC_SLIDER;

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    autoHeight: false,
    autoWidth: true,
    autoplay: false,
    autoplaySpeed: 2000,
    dots: true,
    navText: ['', ''],
    items: 1,
    nav: false,
    responsive: {
      0: {
        items: 1
      }
    }
  };

  slidesStore!: any[];
  slidesStoreMobile!: any[];
  timeout: any;
  width!: number;
  constructor() { }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.width = this.sliderComponent.nativeElement.offsetWidth;
  }

  ngOnInit(): void {
    this.initSlides();
  }

  ngAfterViewChecked(): void {
    this.initTabIndexSlide();
  }

  initSlides() {
    this.slidesStore = [
      {
        id: 'productBICSlider',
        alt: 'ManuConnect',
        src: 'assets/images/manu-connect.webp',
        srcMD: 'assets/images/bc_tablet_carousel_horizontal.png?format=webp',
        srcSM: 'assets/images/bc_tablet_carousel_vertical.png?format=webp',
        srcXS: 'assets/images/mobile-manu-connect.webp',
        data: this.productBICSlider
      },
      {
        id: 'productCISlider',
        alt: 'Online paymet',
        src: 'assets/images/online-payment.jpg?format=webp',
        srcMD: 'assets/images/carousel_max_tu_tin.jpg?format=webp',
        srcSM: 'assets/images/carousel_max_tu_tin.jpg?format=webp',
        srcXS: 'assets/images/mobile_carousel.png?format=webp',
        data: this.productCISlider
      }
    ];
  }

  initTabIndexSlide() {
    let learnMoreEl: any = document.getElementsByClassName('learn-more-click');

    for (let idx = 0; idx < learnMoreEl.length; idx++) {
      learnMoreEl[idx].setAttribute('tabindex', '-1');
    }

    let learnMoreElActive: any = document.getElementsByClassName('slide-learn-more-active');

    if (learnMoreElActive.length > 1) {
      learnMoreElActive[1].setAttribute('tabindex', '5');
    }
  }

  handleTranslated(data: SlidesOutputData) {
    let slidesStore = this.slidesStore;
    for (let idx = 0; idx < slidesStore.length; idx++) {
      const item = slidesStore[idx];
      
      if (data.startPosition == idx) {
        item.data.customClass = 'slide-learn-more-active';
      } else {
        item.data.customClass = '';
      }
    }

    this.slidesStore = slidesStore;
  }
}
