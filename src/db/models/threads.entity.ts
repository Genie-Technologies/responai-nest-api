// Threads.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Messages } from "./messages.entity";
import { Participants } from "./participants.entity";
import { Users } from "./users.entity";

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

  @OneToMany(() => Messages, (message) => message.thread)
  messages: Messages[];

  @OneToMany(() => Participants, (participant) => participant.thread)
  participants: Participants[];
}
