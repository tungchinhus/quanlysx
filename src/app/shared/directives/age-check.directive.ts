import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { DOBService } from 'src/app/shared/services/dob.service';
import { Constant } from 'src/app/constant/constant';

declare const moment: any;

export function ageCheckValidator(validAge: number): ValidatorFn {

  const getAge = (dob: any): number => {
    const today = moment(new Date());
    const birthDate = moment(dob);
    return today.diff(birthDate, 'years', true);
  }

  return (control: AbstractControl): ValidationErrors | null => {
    const dobService: DOBService = new DOBService();
    const dobConvert = dobService.covertDate(control.value);
    if (dobConvert !== Constant.INVALID_DATE) {
      const age = getAge(dobConvert);
      return age < validAge ? { ageCheck: { value: control.value } } : null;
    }

    return null;
  };
}