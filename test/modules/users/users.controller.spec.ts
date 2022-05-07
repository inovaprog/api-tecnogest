import { Test } from '@nestjs/testing';
import { User } from '../../../src/lib/typeorm/entities/user.entity';
import { CustomUserRepository } from '../../../src/lib/typeorm/repositories/user.repository';
import { SignUpDto } from '../../../src/modules/users/dto/sign-up.dto';
import { UsersController } from '../../../src/modules/users/users.controller';
import { UsersService } from '../../../src/modules/users/users.service';

describe('Users Controller', () => {
  let controller: UsersController;

  const mockService = {
    signUp: jest.fn(),
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
});
