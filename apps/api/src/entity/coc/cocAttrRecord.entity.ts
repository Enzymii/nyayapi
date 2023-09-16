import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CocAttrRecord {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ default: 0 })
  app?: number;
  @Column({ default: 0 })
  con?: number;
  @Column({ default: 0 })
  dex?: number;
  @Column({ default: 0 })
  edu?: number;
  @Column({ default: 0 })
  int?: number;
  @Column({ default: 0 })
  pow?: number;
  @Column({ default: 0 })
  siz?: number;
  @Column({ default: 0 })
  str?: number;
  @Column({ default: 0 })
  luck?: number;
}
