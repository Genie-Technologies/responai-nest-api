import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('messages') // <-- Note the lowercase 'm' here
export class Messages extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  message: string;

  @Column()
  sender_id: number;

  @Column()
  receiver_id: number;

  @CreateDateColumn()
  created_date: Date;
}
