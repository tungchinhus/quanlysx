import { MatDialog } from '@angular/material/dialog';
import { TabindexDirective } from './tabindex.directive';

describe('TabindexDirective', () => {
  it('should create an instance', () => {
    const dialog: any = {
      openDialogs:[]
    };
    const directive = new TabindexDirective(dialog);
    expect(directive).toBeTruthy();
  });
});
