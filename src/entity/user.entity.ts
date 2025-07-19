import { BaseEntity, Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class User extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  mobileNumber: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ default: 0 })
  interviewCredits: number;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ default: false })
  mobileNumberVerified: boolean;

  @Column({ nullable: true })
  resume: string;

  @Column({ nullable: true })
  role: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
