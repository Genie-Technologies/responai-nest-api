import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('messages') // <-- Note the lowercase 'm' here
export class Messages extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  message: string;

  @Column()
  sender_id: number;

  @Column()
  receiver_id: number;

  @Column()
  sender_avatar: string;

  @Column()
  receiver_avatar: string;

  @Column()
  sender_name: string;

  @Column()
  receiver_name: string;

  @Column()
  thread_id: number;
}
