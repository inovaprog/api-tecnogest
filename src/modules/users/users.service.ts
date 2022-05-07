import { AttributeType } from '@aws-sdk/client-cognito-identity-provider';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Cognito from '../../lib/aws/cognito';
import { User } from '../../lib/typeorm/entities/user.entity';
import { CustomUserRepository } from '../../lib/typeorm/repositories/user.repository';
import { GetUsersDto } from './dto/get-users.dto';
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
    delete signUpDto.password;
    await Cognito.confirmAccount(signUpDto.email);
    const createdUser: User = await this.userRepository.save(signUpDto);
    const attributes: AttributeType[] = [
      {
        Name: 'custom:userId',
        Value: createdUser.id.toString(),
      },
    ];
    await Cognito.adminEditCognitoUser(createdUser.email, attributes);
    return createdUser;
  }

  async findAll(query?: GetUsersDto) {
    const { page, limit, ...restOfQuery } = query;
    return await this.userRepository.findPaginated(
      { page, limit },
      restOfQuery,
    );
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.userRepository.save({ id, ...updateUserDto });
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
