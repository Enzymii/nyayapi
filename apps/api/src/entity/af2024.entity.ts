import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AF2024Record {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: string;

  @Column()
  val!: string;

  @Column()
  success!: boolean;
}
