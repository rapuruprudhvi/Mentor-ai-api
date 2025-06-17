// src/entities/InterviewPrompt.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ schema: "interview" })
export class InterviewPrompt {
  @PrimaryColumn({ type: "char", length: 26 })
  id: string;

  @Column({ length: 256 })
  question: string;

  @Column({ type: "text" })
  answer: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;
}
