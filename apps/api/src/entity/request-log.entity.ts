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
  from?: string;

  @Column('text')
  params!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ default: 0 })
  resultCode!: number;

  @Column({ nullable: true })
  resultMessage?: string;
}
