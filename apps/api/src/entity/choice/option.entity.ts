// option.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Choice } from './choice.entity';

@Entity()
export class Option {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  content!: string;

  @Column()
  chosen!: boolean;

  @ManyToOne(() => Choice, (choice) => choice.options)
  choice!: Choice;
}
