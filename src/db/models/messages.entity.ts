import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Threads } from "./threads.entity";

@Entity("messages") // <-- Note the lowercase 'm' here
export class Messages {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  message: string;

  @Column({ nullable: true })
  senderId: string;

  @Column({ nullable: true })
  receiverId: string;

  @Column({ type: "uuid", nullable: true })
  threadId: string;

  @Column({ nullable: true })
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;

  @ManyToOne(() => Threads, (thread) => thread.messages)
  thread: Threads;
}
