import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity()
export class Interview extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  title: string

  @Column("uuid")
  userId: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}