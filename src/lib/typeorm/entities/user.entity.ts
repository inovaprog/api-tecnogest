import { Logger } from '@nestjs/common';
import * as moment from 'moment';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  DeleteDateColumn,
  AfterLoad,
  getRepository,
  Index,
} from 'typeorm';
import { Company } from './company.entity';

@Entity('users')
@Unique(['email', 'deletedAt'])
@Index('unique_email_when_deletedat_null', ['email'], {
  where: '"deletedAt" IS NULL',
  unique: true,
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { nullable: false, length: 100 })
  name: string;

  @Column('varchar', { nullable: false, length: 100 })
  email: string;

  @Column('varchar', { nullable: true, length: 30 })
  dateOfBirth: string;

  @Column('varchar', { nullable: true, length: 30 })
  plan: string;

  @Column('varchar', { nullable: true, length: 30 })
  phone: string;

  @Column('timestamp', { nullable: true })
  planValidUntil: Date;

  @Column('simple-array', { nullable: true })
  forceUpdateFields: string[];

  @Column('varchar', { nullable: true, length: 100 })
  street: string;

  @Column('varchar', { nullable: true, length: 10 })
  number: string;

  @Column('varchar', { nullable: true, length: 100 })
  neighborhood: string;

  @Column('varchar', { nullable: true, length: 100 })
  city: string;

  @Column('varchar', { nullable: true, length: 100 })
  state: string;

  @Column('varchar', { nullable: true, length: 100 })
  country: string;

  @Column('varchar', { nullable: true, length: 30 })
  zip: string;

  @Column('varchar', { nullable: true, length: 100 })
  complement: string;

  @ManyToOne(() => User, (user) => user.parent)
  @JoinColumn()
  parent: User;

  @ManyToOne(() => Company, (company) => company.users)
  company: Company;

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

  @AfterLoad()
  async afterLoad() {
    if (this.planValidUntil && this.planValidUntil < moment().toDate()) {
      Logger.log(`User ${this.email} has expired plan.`);
      await getRepository(User).update(this.id, {
        planValidUntil: null,
        plan: 'free',
      });
    }
  }
}
