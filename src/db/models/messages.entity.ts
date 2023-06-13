import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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
}
