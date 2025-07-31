import { Constant } from 'src/app/constant/constant';

export const roundCurrency = (value: any) => {
    const rounded = Math.floor(value / 1000) * 1000;
    const remainder = value % 1000;

    if (remainder >= 500) {
        return rounded + 1000;
    }

    return rounded;
}

export const formatRoundCurrency = (value: any) => {
    const numparse = parseInt(value.toString().replace(Constant.dotRegex, ''), 10) || 0;
    const valueRound = roundCurrency(numparse);
    const formatedCurrency = valueRound.toString().replace(Constant.currencyRegex, '$1.');
    return formatedCurrency;
}

export const formatCurrency = (value: any) => {
    const numparse = parseInt(value.toString().replace(Constant.dotRegex, ''), 10) || 0;
    const formatedCurrency = numparse.toString().replace(Constant.currencyRegex, '$1.');
    return formatedCurrency;
}

export const isRoundCurrency = (value: any) => {
    return value % 1000 != 0;
}