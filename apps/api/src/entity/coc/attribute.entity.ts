import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CocCharacter } from './character.entity';

@Entity()
export class CocAttribute {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ default: 0 })
  value?: number;

  @ManyToOne(() => CocAttribute, (attribute) => attribute.character)
  character!: CocCharacter;
}
