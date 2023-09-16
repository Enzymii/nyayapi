import { Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class allowed_origins {
  @PrimaryColumn()
  uuid!: string;
}
