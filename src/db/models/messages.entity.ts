import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('messages') // <-- Note the lowercase 'm' here
export class Messages extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  message: string;

  @Column('uuid')
  sender_id: string;

  @Column('uuid')
  receiver_id: string;

  @CreateDateColumn()
  created_date: Date;

  @Column()
  thread_id: string;
}
