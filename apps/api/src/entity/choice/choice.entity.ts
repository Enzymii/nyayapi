// choice.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Option } from './option.entity';

@Entity()
export class Choice {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userID!: string;

  @Column()
  optionCount!: number;

  @Column()
  choiceCount!: number;

  @OneToMany(() => Option, (option) => option.choice)
  options!: Option[];
}
