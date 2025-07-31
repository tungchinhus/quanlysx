import { Component, OnInit, Input, HostListener, ViewChild } from '@angular/core';
declare const $: any;

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent implements OnInit {

  @ViewChild('tooltipContent') tooltipContent!: any;
  @Input() content!: string;
  @Input() disabled: boolean = false;
  isShow: boolean = false;
  timeout: any;

  @HostListener('window:click', ["$event.target"]) onClick(event: HTMLElement) {
    if (!event.className.includes('app-tooltip') && this.isShow) {
      this.isShow = false;
      const nativeElement: HTMLElement = this.tooltipContent?.nativeElement;
      const tooltipContainer = nativeElement.closest('.tool-tip');
      tooltipContainer?.classList.remove('tooltip-opened');
      nativeElement.style.width = '';
      nativeElement.style.whiteSpace = '';
    }
  }

  constructor() { }

  ngOnInit(): void {
  }

  toogle(event: any) {
    // event.stopPropagation();
    if (this.isShow || this.disabled) {
      return;
    }
    clearTimeout(this.timeout);
    const nativeElement: HTMLElement = this.tooltipContent?.nativeElement;
    const tooltipContainer = nativeElement.closest('.tool-tip');
    const imgEle: any = tooltipContainer?.firstChild;
    this.timeout = setTimeout(() => {
      this.isShow = !this.isShow;
      nativeElement.style.opacity = '';
      this.timeout = setTimeout(() => {
        let maxWidth = 300;
        const left = $(imgEle).offset()?.left || 0;
        const scrollLeft = $(window).scrollLeft() || 0;
        const posX = left - scrollLeft;
        let rightPos = -5;
        if (window.screen.availWidth < maxWidth) {
          maxWidth = window.screen.availWidth - 30;
        }
        if (posX < maxWidth) {
          rightPos = posX - maxWidth;
          // maxWidth = posX + rightPos;
        } 
        if (nativeElement.clientWidth >= maxWidth) {
          nativeElement.style.width = maxWidth + 'px';
          nativeElement.style.whiteSpace = 'pre-line';
        } else {
          nativeElement.style.width = '';
          nativeElement.style.whiteSpace = '';
        }
        tooltipContainer?.classList.add('tooltip-opened');
        nativeElement.style.right = rightPos + 'px';
        nativeElement.style.opacity = '1';
      });
    });
  }

}
