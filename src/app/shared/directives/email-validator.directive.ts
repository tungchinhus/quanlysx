import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Regexs } from '../utils/regexs';

export function emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      // Skip check if control value is empty (for required validator)
      if(!control.value) return null;
      const localPart = control.value?.split('@')[0];
      const domain = control.value?.split('@')[1];
      if(domain == null || localPart == null || localPart == '') {
        return { pattern: { value: control.value } };
      }
      if(!domain.match(Regexs.DOMAIN)) {
        return { pattern: { value: control.value } };
      }
      const tld = domain.split('.').reverse()[0];
      const remaining = domain.split('.').reverse().slice(0).join('.');
      if(localPart.length > 64 || domain.length > 255) {
        return { pattern: { value: control.value } };
      }
      if(!localPart.match(Regexs.EMAIL_LOCAL_PART)) {
        return { pattern: { value: control.value } };
      }
      if(!tld.match(Regexs.EMAIL_ROOT_DOMAIN)) {
        return { pattern: { value: control.value } };
      }
      if(!remaining.match(Regexs.EMAIL_DOMAIN)) {
        return { pattern: { value: control.value } };
      }
      // Passing all the checks
      return null;
    }
}
