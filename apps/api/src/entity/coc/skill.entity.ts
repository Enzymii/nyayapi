import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CocCharacter } from './character.entity';

@Entity()
@Index(['name', 'character'])
export class CocSkill {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  subName?: string;

  @Column({ nullable: true, default: 0 })
  value?: number; // has most priority

  @Column({ nullable: true, default: 0 })
  enhancement?: number;
  @Column({ nullable: true, default: 0 })
  profession?: number;
  @Column({ nullable: true, default: 0 })
  interest?: number; // can be also added by these three

  @ManyToOne(() => CocSkill, (skill) => skill.character)
  character!: CocCharacter;
}
