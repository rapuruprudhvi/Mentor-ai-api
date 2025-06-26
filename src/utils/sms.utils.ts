export const isMobile = (contact: string): boolean => {
    return /^[6-9]\d{9}$/.test(contact);
};

export const sendOtpToMobile = async (
    mobileNumber: string,
    otp: string
): Promise<void> => {
    console.log(`Sending OTP ${otp} to mobile number ${mobileNumber}`);
    // In a real application, you would integrate with an SMS gateway here
    // e.g., using Twilio, Nexmo, etc.
}

