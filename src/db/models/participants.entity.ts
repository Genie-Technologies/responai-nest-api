import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
} from "typeorm";
import { Threads } from "./threads.entity";
import { Users } from "./users.entity";

@Entity()
export class Participants extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  threadId: string;

  @Column()
  userId: string;

  @ManyToOne(() => Users, (user) => user.participants)
  user: Users;

  @ManyToOne(() => Threads, (thread) => thread.participants)
  thread: Threads;
}
