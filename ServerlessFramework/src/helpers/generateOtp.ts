// Function to generate OTP
export const generateOTP = (): string => {
  const digits = '123456789';
  let otp = '';
  for (let i = 0; i < 6; i++) {
    otp += digits[Math.floor(Math.random() * 9)];
  }
  return otp;
};
