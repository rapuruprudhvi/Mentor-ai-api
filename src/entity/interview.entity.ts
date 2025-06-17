import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity()
export class Interview {
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