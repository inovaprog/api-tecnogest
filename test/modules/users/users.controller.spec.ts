import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService as UsersService } from '../../../src/modules/users/users.service';
import { UserController as UsersController } from '../../../src/modules/users/users.controller';
import { User } from '../../../src/lib/typeorm/entities/users';
import { UpdateUserDto } from '../../../src/modules/users/dto/updateUser.dto';
import { Company } from '../../../src/lib/typeorm/entities/companies';

describe('Users Controller', () => {
    let service: UsersService;
    let controller: UsersController;
    const result: User[] = [new User()];
    const mockRepository = {
        find: jest.fn(),
        getUsers: jest.fn(),
        updateUser: jest.fn(),
        deleteUser: jest.fn(),
        getUserById: jest.fn(),
    };

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                { provide: UsersService, useValue: mockRepository },
                { provide: getRepositoryToken(User), useValue: mockRepository },
                { provide: getRepositoryToken(Company), useValue: {} },
            ],
        }).compile();
        service = moduleRef.get<UsersService>(UsersService);
        controller = moduleRef.get<UsersController>(UsersController);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return an array of users', async () => {
        mockRepository.getUsers.mockResolvedValueOnce(result);
        expect(await controller.getUsers()).toBe(result);
    });

    it('should return user by Id', async () => {
        mockRepository.getUserById.mockResolvedValueOnce(result);
        expect(await controller.findById(1)).toBe(result);
    });

    it('should update user by Id', async () => {
        const updateUserDto: UpdateUserDto = {} as UpdateUserDto;
        mockRepository.updateUser.mockResolvedValueOnce(result);
        expect(await controller.update(1, updateUserDto)).toBe(result);
    });

    it('should delete user by Id', async () => {
        mockRepository.deleteUser.mockResolvedValueOnce(result);
        expect(await controller.delete(1)).toBe(result);
    });
});
