import { ulid } from 'ulid';
import bcrypt from 'bcrypt';
import { User } from '../entity/user.entity';
import { Injectable } from "../decorator/injectable.decorator";
import { DataSource } from 'typeorm';

@Injectable()
export class UserService {
  constructor(private readonly dataSource: DataSource) {}

  async userSignUp(name: string, email: string, mobileNumber: string, password: string,emailVerified: boolean, mobileNumberVerified: boolean){
    const userRepo = this.dataSource.getRepository(User);
    const existingEmail = await this.getUserByEmail(email);

    if (existingEmail){
      throw new Error("User already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    
   return userRepo.save({
      id: ulid(),
      name,
      email,
      mobileNumber,
      password: hashedPassword,
      emailVerified,
      mobileNumberVerified,
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
      throw new Error("Invalid credentials");
    }
    return user;
  }
  
  async userSignOut(userId: string){
  // Optionally blacklist token here
   return `User with ID ${userId} signed out successfully.`;
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
}   

