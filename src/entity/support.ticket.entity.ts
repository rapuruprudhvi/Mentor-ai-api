import {
  BaseEntity,
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  PrimaryColumn,
} from 'typeorm';

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
}

@Entity()
export class SupportTicket extends BaseEntity {
  @Index()
  @PrimaryColumn()
  id: string;

  @Column({ length: 200 })
  subject: string;

  @Column()
  message: string;

  @Index()
  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.OPEN,
  })
  status: TicketStatus;

  @CreateDateColumn({type: "timestamp"})
  createdAt: Date;

  @UpdateDateColumn({type: "timestamp"})
  updatedAt: Date;
}
