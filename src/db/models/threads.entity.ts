// Threads.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Threads {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  messageId: number;

  @Column('text', { array: true, nullable: true })
  user: string[];

  @Column('text', { array: true, nullable: true })
  message: string[];

  @Column()
  createdAt: Date;

  @Column()
  isActive: boolean;
}
