import { ulid } from 'ulid';
import bcrypt from 'bcrypt';
import { User } from '../entity/user.entity';
import { Injectable } from "../decorator/injectable.decorator";
import { DataSource } from 'typeorm';
import { BlacklistedToken } from '../entity/blacklisted-token.entity';
import { generateOTP } from "../utils/otp.utils";
import { isEmail, sendVerificationEmail } from "../utils/mail.utils";
import { isMobile, sendOtpToMobile } from '../utils/sms.utils';
import { UpdateUserInput } from '../dto/auth.validation';
import { Payment } from '../entity/payment.entity';
import { Interview } from '../entity/interview.entity';
import { InterviewSession } from '../entity/interview.session.entity';
import { InterviewPrompt } from '../entity/InterviewPrompt';


type OtpEntry = {
  otp: string;
  expiry: number;
};

const otpStore = new Map<string, OtpEntry>();

@Injectable()
export class UserService {
  constructor(private readonly dataSource: DataSource) { }

  async userSignUp(name: string, email: string, mobileNumber: string, password: string) {
    const userRepo = this.dataSource.getRepository(User);
    const existingEmail = await this.getUserByEmail(email);

    if (existingEmail) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);


    return userRepo.save({
      id: ulid(),
      name,
      email,
      mobileNumber,
      password: hashedPassword,
      emailVerified: false,
      mobileNumberVerified: false,
      createdAt: new Date(),
    });
  }

  async userSignIn(identifier: string, password: string) {
    const user = (await this.getUserByEmail(identifier)) || (await this.getUserByNumber(identifier));

    if (!user) {
      throw new Error("User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error("Invalid email or password");
    }
    return user;
  }

  async isTokenBlacklisted(token: string) {
    const repo = this.dataSource.getRepository(BlacklistedToken);
    const found = await repo.findOneBy({ token });
    return !!found;
  }

  async blacklistToken(token: string) {
    const repo = this.dataSource.getRepository(BlacklistedToken);
    const alreadyBlacklisted = await repo.findOneBy({ token });

    if (!alreadyBlacklisted) {
      await repo.save({
        id: ulid(),
        token,
        blacklistedAt: new Date(),
      });
    }
  }

  async getUserByEmail(email: string) {
    return this.dataSource.getRepository(User).findOneBy({ email });
  }

  async getUserByNumber(mobileNumber: string) {
    return this.dataSource.getRepository(User).findOneBy({ mobileNumber });
  }

  async getUserById(id: string) {
    return this.dataSource.getRepository(User).findOneBy({ id });
  }

  async sendOtp(contact: string) {
    const user = (await this.getUserByEmail(contact)) || (await this.getUserByNumber(contact));
    if (!user) throw new Error("User not found");

    const otp = generateOTP();
    const expiry = Date.now() + 10 * 60 * 1000;

    otpStore.set(contact, { otp, expiry });

    if (isEmail(contact)) {
      await sendVerificationEmail(contact, otp);
    } else {
      await sendOtpToMobile(contact, otp);
    }

    return {
      contact,
      otp,
      expiry: new Date(expiry),
      message: "OTP sent successfully",
    };
  }

  async verifyOtp(contact: string, otp: string) {
    const saved = otpStore.get(contact);
    const userRepo = this.dataSource.getRepository(User);
    if (!saved) throw new Error("OTP not found or expired");

    if (Date.now() > saved.expiry) {
      otpStore.delete(contact);
      throw new Error("OTP has expired");
    }

    if (saved.otp !== otp) {
      throw new Error("Invalid OTP");
    }

    if (isEmail(contact)) {
      await userRepo.update({ email: contact }, { emailVerified: true });
    } else if (isMobile(contact)) {
      await userRepo.update({ mobileNumber: contact }, { mobileNumberVerified: true });
    } else {
      throw new Error("Invalid contact identifier");
    }

    otpStore.delete(contact);
    return {
      contact,
      otp,
      message: "Contact verified successfully",
    };
  }

  async resetUserPassword(user: User, newPassword: string) {
    const repo = this.dataSource.getRepository(User);
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await repo.save(user);
    return { user };
  }

  async getUser(userId: string) {
    const userRepo = this.dataSource.getRepository(User);

    const user = await userRepo.findOne({
      where: { id: userId },
    });

    return user;
  }

  async updateUser(userId: string, updates: UpdateUserInput) {
    const userRepo = this.dataSource.getRepository(User);
    const user = await this.getUserById(userId)
    if (!user) throw new Error("User not found");

    if (updates.currentPassword && updates.changePassword) {
      const isSame = await bcrypt.compare(updates.currentPassword, user.password);
      if (!isSame) throw new Error("Current password is incorrect");

      const isIdentical = await bcrypt.compare(updates.changePassword, user.password);
      if (isIdentical) throw new Error("New password must be different from current password");

      user.password = await bcrypt.hash(updates.changePassword, 10);
    }

    if (updates.name) user.name = updates.name;
    if (updates.email) user.email = updates.email;
    if (updates.mobileNumber) user.mobileNumber = updates.mobileNumber;
    if (updates.role) user.role = updates.role;
    if (updates.resume) user.resume = updates.resume;
    
    await userRepo.save(user);
    return user;
  }

  async deleteUser(userId: string) {
    const user = await this.getUserById(userId);
    if (!user) throw new Error("User not found");

    return await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(InterviewPrompt).delete({ userId });
      await manager.getRepository(InterviewSession).delete({ userId });
      await manager.getRepository(Interview).delete({ userId });
      await manager.getRepository(Payment).delete({ userId });
      await manager.getRepository(User).delete({ id: userId });
    });
  }
}