import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity()
export class Resume {
  @PrimaryColumn()
  id: string

  @Column()
  userId: string

  @Column()
  originalName: string

  @Column()
  fileName: string

  @Column()
  filePath: string

  @Column()
  fileSize: number

  @Column()
  mimeType: string

  @Column({ default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
