import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity()
export class Payment extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ nullable: true })
  stripeSessionId: string

  @Column({ nullable: true })
  stripePaymentIntentId: string

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number

  @Column()
  currency: string

  @Column()
  planType: string

  @Column()
  interviewCredits: number

  @Column({ default: "completed" })
  status: string

  @Column({ nullable: true })
  paymentMethod: string

  @Column({ nullable: true })
  receiptUrl: string

  @Column({ type: "json", nullable: true })
  metadata: Record<string, any>

  @Column("uuid")
  userId: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}