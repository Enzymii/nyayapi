import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CocAttribute } from './attribute.entity';
import { CocSkill } from './skill.entity';

@Entity()
export class CocCharacter {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  creator!: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  gender?: string;

  @Column({ nullable: true })
  age?: number;

  @Column({ nullable: true })
  job?: string;

  @Column({ nullable: true })
  birthplace?: string;

  @Column({ nullable: true })
  residence?: string;

  @OneToMany(() => CocCharacter, (character) => character.attributes)
  attributes?: CocAttribute[];

  @OneToMany(() => CocCharacter, (character) => character.skills)
  skills?: CocSkill[];
}
