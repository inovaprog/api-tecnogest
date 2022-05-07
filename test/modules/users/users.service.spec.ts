import { SignUpCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
import { Test } from '@nestjs/testing';
import Cognito from '../../../src/lib/aws/cognito';
import { User } from '../../../src/lib/typeorm/entities/user.entity';
import { CustomUserRepository } from '../../../src/lib/typeorm/repositories/user.repository';
import { SignUpDto } from '../../../src/modules/users/dto/sign-up.dto';
import { UpdateUserDto } from '../../../src/modules/users/dto/update-user.dto';
import { UsersService } from '../../../src/modules/users/users.service';

describe('Users Service', () => {
  let service: UsersService;

  const mockRepository = {
    save: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: CustomUserRepository, useValue: mockRepository },
      ],
    }).compile();
    service = moduleRef.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('shoud be return a registered user', async () => {
    const req = {} as SignUpDto;
    const user = { id: 1 } as User;
    mockRepository.save.mockResolvedValueOnce(user);
    const resultCognito = {} as SignUpCommandOutput;
    jest.spyOn(Cognito, 'signUp').mockResolvedValueOnce(resultCognito);
    jest
      .spyOn(Cognito, 'adminEditCognitoUser')
      .mockResolvedValueOnce(resultCognito);
    jest.spyOn(Cognito, 'confirmAccount').mockResolvedValueOnce(resultCognito);
    expect(await service.signUp(req)).toStrictEqual(user);
  });

  it('shoud be return a updated user', async () => {
    const req = {} as UpdateUserDto;
    const user = { id: 1 } as User;
    mockRepository.save.mockResolvedValueOnce(user);
    expect(await service.update(1, req)).toStrictEqual(user);
  });
});
