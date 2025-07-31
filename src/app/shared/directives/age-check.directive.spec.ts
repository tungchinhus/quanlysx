import { FormControl, FormGroup } from '@angular/forms';
import { ageCheckValidator } from 'src/app/shared/directives/age-check.directive';
let moment = require('moment');
describe('AgeCheckDirective', () => {
    const form = new FormGroup({
        dateOfBirth: new FormControl('', [
            ageCheckValidator(15)
          ]),
    });
    beforeEach(() => {
        (<any>window).moment = moment;
        form.markAllAsTouched();
        form.controls.dateOfBirth.updateValueAndValidity();
    });
    it('should valid', () => {
        form.controls.dateOfBirth.setValue('01/01/2000');
        expect(form.controls.dateOfBirth.valid).toBeTruthy();
    });
    it('should not valid', () => {
        form.controls.dateOfBirth.setValue('01/01/2009');
        expect(form.controls.dateOfBirth.valid).toBeFalsy();
    });

    it('should not validate by default (form must be valid)', () => {
        form.controls.dateOfBirth.setValue('');
        expect(form.controls.dateOfBirth.valid).toBeTruthy();
    });
});
