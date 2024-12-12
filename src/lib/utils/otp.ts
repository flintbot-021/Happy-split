export function generateOTP(): string {
  return Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase();
}

export function validateOTP(otp: string): boolean {
  return /^[A-Z0-9]{4}$/.test(otp);
}