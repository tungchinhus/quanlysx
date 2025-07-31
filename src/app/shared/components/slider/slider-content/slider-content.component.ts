import { Component, Input, OnInit } from '@angular/core';
import { SliderContentData } from '../slider-content-data-model';

@Component({
  selector: 'app-slider-content',
  templateUrl: './slider-content.component.html',
  styleUrls: ['./slider-content.component.scss']
})
export class SliderContentComponent implements OnInit {
  @Input() data!: SliderContentData;

  constructor() { }

  ngOnInit(): void {
  }

  // navigateToLink() {
  //   this.routeNavService.route(this.data.url);

  //   this.adobeTrackingService.trackEvent({
  //     event_category: 'body',
  //     event_type: 'carousel',
  //     event_label: this.data.bannerName
  //   });
  // }
}
