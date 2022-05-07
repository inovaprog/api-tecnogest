import { Test } from '@nestjs/testing';
import { User } from '../../../src/lib/typeorm/entities/user.entity';
import { CustomUserRepository } from '../../../src/lib/typeorm/repositories/user.repository';
import { GetUsersDto } from '../../../src/modules/users/dto/get-users.dto';
import { SignInDto } from '../../../src/modules/users/dto/sign-in.dto';
import { SignUpDto } from '../../../src/modules/users/dto/sign-up.dto';
import { UpdateUserDto } from '../../../src/modules/users/dto/update-user.dto';
import { UsersController } from '../../../src/modules/users/users.controller';
import { UsersService } from '../../../src/modules/users/users.service';

describe('Users Controller', () => {
  let controller: UsersController;

  const mockService = {
    signUp: jest.fn(),
    update: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    signIn: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockService },
        { provide: CustomUserRepository, useValue: mockService },
      ],
    }).compile();
    controller = moduleRef.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('shoud be return a registered user', async () => {
    const req = {} as SignUpDto;
    const user = {} as User;
    mockService.signUp.mockResolvedValue(user);
    expect(await controller.signUp(req)).toStrictEqual(user);
  });

  it('shoud be return a created user', async () => {
    const req = {} as SignUpDto;
    const user = {} as User;
    mockService.signUp.mockResolvedValue(user);
    mockService.update.mockResolvedValue(user);
    expect(await controller.create(req)).toStrictEqual(user);
  });

  it('shoud be return a list of users', async () => {
    const req = {} as GetUsersDto;
    const users = [{} as User];
    mockService.findAll.mockResolvedValue(users);
    expect(await controller.findAll(req)).toStrictEqual(users);
  });

  it('shoud return one user', async () => {
    const user = {} as User;
    mockService.findOne.mockResolvedValueOnce(user);
    expect(await controller.findOne('1')).toStrictEqual(user);
  });

  it('shoud return token by login', async () => {
    const token = {} as any;
    const req = {} as SignInDto;
    mockService.signIn.mockResolvedValueOnce(token);
    expect(await controller.signIn(req)).toStrictEqual(token);
  });

  it('shoud return updated user', async () => {
    const user = {} as User;
    const req = {} as UpdateUserDto;
    mockService.update.mockResolvedValueOnce(user);
    expect(await controller.update('1', req)).toStrictEqual(user);
  });

  it('shoud return ok to delete user', async () => {
    mockService.remove.mockResolvedValueOnce('ok');
    expect(await controller.remove('1')).toStrictEqual('ok');
  });
});
