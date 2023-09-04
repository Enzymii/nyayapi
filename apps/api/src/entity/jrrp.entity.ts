import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Jrrp {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: string;

  @Column()
  jrrp!: number;

  @Column()
  date!: string;
}
