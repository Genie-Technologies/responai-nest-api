import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  OneToMany,
} from "typeorm";
import { Participants } from "./participants.entity";

@Entity("users")
export class Users extends BaseEntity {
  @PrimaryColumn({ nullable: false })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  authOId: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  picture: string;

  @Column({ nullable: true })
  joined: Date;

  @Column({ nullable: true })
  lastLogin: Date;

  @Column({ nullable: true })
  locale: string;

  @Column({ nullable: true })
  phone: string;

  // TODO: Not exactly sure what these relationship decorators are doing. GPT told me to add
  // them to build a query but ended up not working. Will investigate later.
  @OneToMany(() => Participants, (participant) => participant.thread)
  participants: Participants[];
}
