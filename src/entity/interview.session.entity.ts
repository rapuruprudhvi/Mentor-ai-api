import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity()
export class InterviewSession {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  userId: string

  @Column("uuid")
  interviewId: string

  @Column({ default: "active" })
  status: string

  @Column({ type: "timestamp", nullable: true })
  startedAt: Date

  @Column({ type: "timestamp", nullable: true })
  endedAt: Date

  @Column({ default: 0 })
  durationInSeconds: number

  @Column({ default: 0 })
  creditsUsed: number

  @Column({ type: "json", nullable: true })
  sessionData: Record<string, any>

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
