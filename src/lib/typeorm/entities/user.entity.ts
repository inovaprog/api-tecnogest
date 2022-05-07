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

  @Column('text', { nullable: false })
  name: string;

  @Column('text', { nullable: false })
  email: string;

  @Column('text', { nullable: true })
  dateOfBirth: string;

  @Column('text', { nullable: true })
  plan: string;

  @Column('text', { nullable: true })
  phone: string;

  @Column('timestamp', { nullable: true })
  planValidUntil: Date;

  @Column('simple-array', { nullable: true })
  forceUpdateFields: string[];

  @Column('text', { nullable: true })
  street: string;

  @Column('text', { nullable: true })
  number: string;

  @Column('text', { nullable: true })
  neighborhood: string;

  @Column('text', { nullable: true })
  city: string;

  @Column('text', { nullable: true })
  state: string;

  @Column('text', { nullable: true })
  country: string;

  @Column('text', { nullable: true })
  zip: string;

  @Column('text', { nullable: true })
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
