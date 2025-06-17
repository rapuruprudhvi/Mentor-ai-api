import { Entity, Column, CreateDateColumn, PrimaryColumn } from "typeorm";

@Entity()
export class BlacklistedToken {
  @PrimaryColumn()
  id: string;

  @Column()
  token: string;

  @CreateDateColumn()
  blacklistedAt: Date;
}