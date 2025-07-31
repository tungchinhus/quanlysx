import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appDynamicInput]'
})
export class DynamicInputDirective implements OnInit {

  private el!: HTMLInputElement;

  constructor(
    private elementRef: ElementRef
  ) {
    this.el = elementRef.nativeElement;
  }

  ngOnInit(): void {
    const span = document.createElement('span');
    span.classList.add('input-ghost');
    span.innerText = this.el.value;
    this.el.parentElement?.append(span);
    this.setWidth();
    this.el.oninput = (event: any) => {
      this.setWidth();
    };
    this.el.onblur = (event: any) => {
      this.setWidth();
    };
    this.el.onfocus = (event: any) => {
      this.setWidth();
    };
  }
  
  setWidth() {
    const inputGhost = document.getElementsByClassName('input-ghost')[0] as any;
    const matFormField = this.el.closest('mat-form-field') as any;
    if (inputGhost && matFormField) {
      inputGhost.innerText = this.el.value;
      const matSuffixWidth = 72;
      const inputGhostWidth = inputGhost.offsetWidth + matSuffixWidth;
      matFormField.style.width = inputGhostWidth + 'px';
    }
  }

}
