declare const moment: any;

export const compareDate = (dateTimeA: any, dateTimeB: any) => {
  const momentA = moment(dateTimeA, 'MM/DD/YYYY');
  const momentB = moment(dateTimeB, 'MM/DD/YYYY');

  if (momentA > momentB) return 1;
  else if (momentA < momentB) return -1;
  else return 0;
};

export const formatDateBirth = (date: string): string => {
  if (!date) {
    return '';
  }
  date = date.replace(/[^0-9]/g, '');
  if (date.length > 8) {
    date = date.substring(0, 8);
  }
  if (date.length >= 1 && date.length <= 2) {
    return date.replace(/^(\d{1,2}).*/, '$1');
  }
  if (date.length >= 3 && date.length <= 4) {
    return date.replace(/^(\d{2})(\d{1,2}).*/, '$1/$2');
  }
  if (date.length >= 5 && date.length <= 8) {
    return date.replace(/^(\d{2})(\d{2})(\d{1,4}).*/, '$1/$2/$3');
  }
  return date.replace(/^(\d{2})(\d{2})(\d{1,4}).*/, '$1/$2/$3');
};

export const phoneNumberFormater = (phone: string): string => {
  if (!phone) {
    return '';
  }
  phone = phone.replace(/[^0-9]/g, '');
  if (phone.length > 10) {
    phone = phone.substring(0, 10);
  }
  if (phone.length >= 1 && phone.length <= 3) {
    return phone.replace(/^(\d{1,3}).*/, '($1');
  }
  if (phone.length >= 4 && phone.length <= 6) {
    return phone.replace(/^(\d{3})(\d{1,3}).*/, '($1) $2');
  }
  if (phone.length >= 7 && phone.length <= 10) {
    return phone.replace(/^(\d{3})(\d{3})(\d{1,4}).*/, '($1) $2-$3');
  }
  return phone.replace(/^(\d{3})(\d{2})(\d{4}).*/, '($1) $2-$3');
};

export const formatOTP = (str: string): string => {
  return str.replace(/[^0-9]/g, '');
};

export const formatIdNumber = (str: string): string => {
  return str.replace(/[^a-zA-Z0-9]/g, '');
};

export const getNumberFromString = (str: string): string => {
  return str.replace(/[^\d]/g, '');
};

export const formatDay = (day: number) => {
  switch (day) {
    case 1: {
      return `${day}st`;
    }
    case 2: {
      return `${day}nd`;
    }
    case 3: {
      return `${day}rd`;
    }
    default: {
      return `${day}th`;
    }
  }
};

export const formatDayOfWeek = (day: number) => {
  switch (day) {
    case 0: {
      return 'Sunday';
    }
    case 1: {
      return 'Monday';
    }
    case 2: {
      return 'Tuesday';
    }
    case 3: {
      return 'Wednesday';
    }
    case 4: {
      return 'Thursday';
    }
    case 5: {
      return 'Friday';
    }
    case 6: {
      return 'Saturday';
    }
    default: {
      throw new Error('Invalid Day');
    }
  }
};

export const convertTitleCase = (title: string) => {
  const capitzalize = (str: string) => str[0].toUpperCase() + str.slice(1);

  const exceptions = ['a', 'an', 'and', 'the', 'but', 'or', 'on', 'in', 'with', 'for', 'at'];

  const titleCase = title
    .toLowerCase()
    .split(' ')
    .map((word) => (exceptions.includes(word) ? word : capitzalize(word)))
    .join(' ');

  return capitzalize(titleCase);
};
