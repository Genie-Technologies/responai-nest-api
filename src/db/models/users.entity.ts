import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class Users extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  authOId: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  familyName: string;

  @Column({ nullable: true })
  firstName: string;

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
}
