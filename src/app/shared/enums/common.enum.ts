export enum TYPE_MESSAGE {
  ERROR = 'error',
  SUCCESS = 'success'
}
export enum ERROR_CODE {
  UNAUTHORIZED = 401
}
export enum PAYMENT_STATUS {
  CANCELED = 'CANCELED',
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  IN_PROGRESS = 'IN_PROGRESS'
}

export enum STATUS {
  NEW = 0,           // Mới
  PROCESSING = 1,    // Đang xử lý
  PROCESSED = 2,     // Đã xử lý
  COMPLETED = 3      // Hoàn thành (dùng cho KCS)
}
