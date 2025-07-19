import { BaseEntity, Entity, Column, CreateDateColumn, PrimaryColumn } from "typeorm";

@Entity()
export class BlacklistedToken extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  token: string;

  @CreateDateColumn()
  blacklistedAt: Date;
}