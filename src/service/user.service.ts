import { ulid } from 'ulid';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../config/database';
import { User } from '../entity/user.entity';

export const createUser = async (
  name: string,
  email: string,
  password: string
): Promise<User> => {
  const userRepo = AppDataSource.getRepository(User);
  const existingUser = await userRepo.findOne({ where: { email } });

  if (existingUser) throw new Error('Email already exists');

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = userRepo.create({
    id: ulid(),
    name,
    email,
    password: hashedPassword,
    createdAt: new Date(),
  });

  return await userRepo.save(user);
};
