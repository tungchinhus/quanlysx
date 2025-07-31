import { DynamicInputDirective } from './dynamic-input.directive';

describe('DynamicInputDirective', () => {
  it('should create an instance', () => {
    const elementRef = {
      nativeElement: {
        oninput: () => {},
        onblur: () => {},
        onfocus: () => {}
      }
    }
    const directive = new DynamicInputDirective(elementRef);
    expect(directive).toBeTruthy();
  });
});
