import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { UUID } from 'crypto';

@Entity()
export class Participants extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  threadId: string;

  @Column()
  userId: string;
}
