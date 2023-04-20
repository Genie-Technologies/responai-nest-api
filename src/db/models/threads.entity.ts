// Threads.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Threads {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @Column()
  createdAt: Date;

  @Column()
  isActive: boolean;

  @Column({ nullable: true })
  lastMessage: string;

  @Column({ nullable: true })
  threadName: string;

  @Column()
  threadLinkId: string;
}
