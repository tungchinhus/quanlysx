export class SliderContentData {
    titles!: string[];
    descriptions!: string[];
    url!: string;
    bannerName!: string;
    customClass!: string;
}

const BIC_TEXT = 'manu-connect';
export const BIC_SLIDER: SliderContentData = {
    titles: [BIC_TEXT],
    descriptions: ['policy-management', 'sub-policy-management'],
    url: 'https://hopdongcuatoi.manulife.com.vn/',
    bannerName: BIC_TEXT,
    customClass: 'slide-learn-more-active'
};

const CI_TEXT = 'online-payment';
export const CI_SLIDER: SliderContentData = {
    titles: ['Đóng phí', 'Trực tuyến'],
    descriptions: ['online-payment'],
    url: '',
    bannerName: CI_TEXT,
    customClass: ''
};
