import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { unique: true, length: 100 })
  name: string;

  @Column('int', { nullable: true })
  seats: number;

  @Column('varchar', { nullable: true, length: 15 })
  primaryColor: string;

  @Column('varchar', { nullable: true, length: 15 })
  secondaryColor: string;

  @OneToMany(() => User, (user) => user.company, { cascade: true })
  users: User[];

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
