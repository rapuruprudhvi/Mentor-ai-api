import {
  BaseEntity,
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity({ schema: "interview" })
export class InterviewPrompt extends BaseEntity {
  @PrimaryColumn({ type: "char", length: 26 })
  id: string;

  @Column({ length: 256 })
  question: string;

  @Column({ type: "text" })
  answer: string;

  @Column("uuid")
  userId: string;

  @Column("uuid")
  sessionId: string;


  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;
}
