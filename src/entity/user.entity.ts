
import { Entity, PrimaryColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true }) 
  mobileNumber: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ default: false })
  mobileNumberVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

