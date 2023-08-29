import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class RequestLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  method!: string;

  @Column()
  path!: string;

  @Column({ nullable: true })
  fromId?: string;

  @Column({ nullable: true })
  fromPlatform?: string;

  @Column('text')
  params!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
