export enum PaymentStatus {
  success = 'SUCCESS',
  failed = 'FAILED',
  pending = 'PENDING',
  expired = 'EXPIRED',
  initiated = 'INITIATED',
}

export enum PaymentTypes {
  initiated = 'Initiated',
  opened = 'Opened',
  processing = 'Processing',
  completed = 'Completed',
  cancelled = 'Cancelled',
  expired = 'Expired',
}
