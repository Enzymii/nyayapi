import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DiceRecord {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: string;

  @Column()
  val!: number;

  @Column()
  max!: number;
}
