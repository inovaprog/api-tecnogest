import { AttributeType } from '@aws-sdk/client-cognito-identity-provider';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Cognito from '../../lib/aws/cognito';
import { User } from '../../lib/typeorm/entities/user.entity';
import { CustomUserRepository } from '../../lib/typeorm/repositories/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(CustomUserRepository, 'default')
    private userRepository: CustomUserRepository,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    await Cognito.signUp(signUpDto);
    const createdUser: User = await this.userRepository.save(signUpDto);
    const attributes: AttributeType[] = [
      {
        Name: 'userId',
        Value: createdUser.id.toString(),
      },
    ];
    await Cognito.adminEditCognitoUser(createdUser.email, attributes);
    return createdUser;
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
