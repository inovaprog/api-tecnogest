import {
    AdminGetUserCommandOutput,
    AdminUpdateUserAttributesCommandOutput,
    ConfirmSignUpCommandOutput,
    ResendConfirmationCodeCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import Cognito from '../../../src/lib/aws/cognito';
import { UserStatus } from '../../../src/lib/enum/status.enum';
import { IRegisterUser } from '../../../src/lib/interfaces/users.interface';
import { Address } from '../../../src/lib/typeorm/entities/addresses';
import { Company } from '../../../src/lib/typeorm/entities/companies';
import { Group } from '../../../src/lib/typeorm/entities/groups';
import { User } from '../../../src/lib/typeorm/entities/users';
import { EventRepository } from '../../../src/lib/typeorm/repositories/events.repository';
import { PlayerRepository } from '../../../src/lib/typeorm/repositories/player.repository';
import { UserRepository } from '../../../src/lib/typeorm/repositories/users.repository';
import UsersFunctions from '../../../src/lib/utils/users-functions';
import { UpdateUserGroup } from '../../../src/modules/users/dto/update-user-group.dto';
import { UserService as UsersService } from '../../../src/modules/users/users.service';
import * as csvToJson from 'convert-csv-to-json';
import CompanyFunctions from '../../../src/lib/utils/company-functions';

describe('Users Service', () => {
    let service: UsersService;
    const result = [];

    const mockRepository = {
        find: jest.fn(),
        findOne: jest.fn(),
        getUsersPaginated: jest.fn(),
        signUp: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        countUsersWithouMissions: jest.fn(),
        countActiveUsers: jest.fn(),
        countUsersKpis: jest.fn(),
        count: jest.fn(),
    };

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                UsersService,
                UsersFunctions,
                CompanyFunctions,
                { provide: getRepositoryToken(Group), useValue: mockRepository },
                { provide: getRepositoryToken(Company), useValue: mockRepository },
                { provide: getRepositoryToken(Address), useValue: mockRepository },
                { provide: getRepositoryToken(PlayerRepository), useValue: mockRepository },
                { provide: getRepositoryToken(EventRepository), useValue: mockRepository },
                { provide: getRepositoryToken(Company), useValue: mockRepository },
                { provide: UserRepository, useValue: mockRepository },
                { provide: Cognito, useValue: mockRepository },
            ],
        }).compile();
        service = moduleRef.get<UsersService>(UsersService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return a users list', async () => {
        mockRepository.getUsersPaginated.mockResolvedValueOnce(result);
        expect(await service.getUsers('1', '10')).toStrictEqual(result);
    });

    it('should return a users list by query', async () => {
        mockRepository.find.mockResolvedValueOnce(result);
        expect(await service.getUserByQuery({})).toStrictEqual(result);
    });

    it('should return a users list by query with name', async () => {
        mockRepository.find.mockResolvedValueOnce(result);
        expect(await service.getUserByQuery({ name: 'test' })).toStrictEqual(result);
    });

    it('should return user search by id', async () => {
        mockRepository.findOne.mockResolvedValueOnce(result);
        expect(await service.getUserById(1)).toStrictEqual(result);
    });

    it('shoud confirm signup user', async () => {
        const payload = {
            code: '123456',
            username: '123456',
        };

        const response = { $metadata: 'ok' } as ConfirmSignUpCommandOutput;
        jest.spyOn(Cognito, 'confirmSignUp').mockResolvedValueOnce(response);

        expect(await service.confirmSignUp(payload)).toStrictEqual(response);
    });

    it('should return the error in users search', async () => {
        mockRepository.getUsersPaginated.mockRejectedValue(new Error('TestError'));
        try {
            await service.getUsers('1', '10');
        } catch (error) {
            expect(error).toBeInstanceOf(HttpException);
            expect(error).toHaveProperty('message', 'TestError');
        }
    });

    it('should return the error in users search by query', async () => {
        mockRepository.find.mockRejectedValue(new Error('TestErrorByQuery'));
        try {
            await service.getUserByQuery({});
        } catch (error) {
            expect(error).toBeInstanceOf(HttpException);
            expect(error).toHaveProperty('message', 'TestErrorByQuery');
        }
    });

    it('should return the error in users search by id', async () => {
        mockRepository.find.mockRejectedValue(new Error('TestErrorByQuery'));
        try {
            await service.getUserById(null);
        } catch (error) {
            expect(error).toBeInstanceOf(HttpException);
            expect(error).toHaveProperty('message', 'User not found');
        }
    });

    it('should return the number of users without missions', async () => {
        const startDate = '';
        const endDate = '';
        const filters = {};
        const numberOfUsers = 1;
        mockRepository.countUsersWithouMissions.mockResolvedValueOnce(numberOfUsers);
        expect(await service.countUsersWithouMissions(startDate, endDate, filters)).toStrictEqual(numberOfUsers);
    });

    it('should return an error when trying to count users without missions', async () => {
        const startDate = '';
        const endDate = '';
        const filters = {};
        mockRepository.countUsersWithouMissions.mockRejectedValue(new Error('CountTestError'));
        try {
            await service.countUsersWithouMissions(startDate, endDate, filters);
        } catch (error) {
            expect(error).toBeInstanceOf(HttpException);
            expect(error).toHaveProperty('message', 'CountTestError');
        }
    });

    it('should return the number of active users', async () => {
        const startDate = '';
        const endDate = '';
        const filters = {};
        const numberOfUsers = 1;
        mockRepository.countActiveUsers.mockResolvedValueOnce(numberOfUsers);
        expect(await service.countActiveUsers(startDate, endDate, filters)).toStrictEqual(numberOfUsers);
    });

    it('should return an error when trying to count active users', async () => {
        const startDate = '';
        const endDate = '';
        const filters = {};
        mockRepository.countActiveUsers.mockRejectedValue(new Error('Count test error'));
        try {
            await service.countActiveUsers(startDate, endDate, filters);
        } catch (error) {
            expect(error).toBeInstanceOf(HttpException);
            expect(error).toHaveProperty('message', 'Count test error');
        }
    });

    it('should update user group', async () => {
        const group = {};
        const updatedAt = null;
        const user = { updatedAt, group };
        const body: UpdateUserGroup = { email: '', groupId: 1 };
        mockRepository.findOne.mockResolvedValueOnce(group);
        mockRepository.findOne.mockResolvedValueOnce(user);
        mockRepository.save.mockResolvedValueOnce(user);
        user.updatedAt = new Date();
        user.group = group;
        expect(await service.updateGroup(body)).toStrictEqual(user);
    });

    it('should return an error when trying to update user group', async () => {
        const group = undefined;
        const body: UpdateUserGroup = { email: '', groupId: 1 };
        mockRepository.findOne.mockResolvedValueOnce(group);
        try {
            await service.updateGroup(body);
        } catch (error) {
            expect(error).toBeInstanceOf(HttpException);
            expect(error).toHaveProperty('message', 'Group not found');
        }
    });

    it('should count users', async () => {
        const startDate = '';
        const endDate = '';
        const filters = {};
        const numberOfUsers = 1;
        mockRepository.countUsersKpis.mockResolvedValueOnce(numberOfUsers);
        expect(await service.countUsers(startDate, endDate, filters)).toStrictEqual(numberOfUsers);
    });

    it('should return an error when trying to count users', async () => {
        const startDate = '';
        const endDate = '';
        const filters = {};
        mockRepository.countUsersKpis.mockRejectedValue(new Error('Count test error'));
        try {
            await service.countUsers(startDate, endDate, filters);
        } catch (error) {
            expect(error).toBeInstanceOf(HttpException);
            expect(error).toHaveProperty('message', 'Count test error');
        }
    });

    it('should count dependents', async () => {
        const user = {};
        const email = '';
        const count = 1;
        const result = { count };
        mockRepository.findOne.mockResolvedValueOnce(user);
        mockRepository.count.mockResolvedValueOnce(count);
        expect(await service.countDependents(email)).toStrictEqual(result);
    });

    it('should return an error when count dependents', async () => {
        const user = undefined;
        const email = '';
        mockRepository.findOne.mockResolvedValueOnce(user);
        const error = new HttpException('User not found', HttpStatus.NOT_FOUND);
        try {
            await service.countDependents(email);
        } catch {
            expect(error).toBeInstanceOf(HttpException);
            expect(error).toHaveProperty('message', 'User not found');
        }
    });

    it('should change phone number', async () => {
        const response = { Username: 'name', UserStatus: 'CONFIRMED' } as AdminGetUserCommandOutput;
        const phoneNumber = 'phone number';
        const username = 'name';
        jest.spyOn(Cognito, 'getUser').mockResolvedValueOnce(response);
        expect(await service.changePhone(username, phoneNumber)).toStrictEqual(undefined);
    });

    it('should try to resend confirmation code when user status is not confirmed', async () => {
        const userData = { Username: 'name', UserStatus: 'NOTCONFIRMED' } as AdminGetUserCommandOutput;
        const resendConfirmationResponse = {} as ResendConfirmationCodeCommandOutput;
        const updateUserAttributesResponse = {} as AdminUpdateUserAttributesCommandOutput;
        const phoneNumber = 'phone number';
        const username = 'name';
        jest.spyOn(Cognito, 'getUser').mockResolvedValueOnce(userData);
        jest.spyOn(Cognito, 'adminEditCognitoUser').mockResolvedValueOnce(updateUserAttributesResponse);
        jest.spyOn(Cognito, 'resendConfirmationCode').mockResolvedValueOnce(resendConfirmationResponse);
        expect(await service.changePhone(username, phoneNumber)).toStrictEqual(resendConfirmationResponse);
    });

    it('should return an error when trying to change phone number', async () => {
        const phoneNumber = 'phone number';
        const username = 'name';
        jest.spyOn(Cognito, 'getUser').mockRejectedValue(new Error('Resend error'));
        try {
            await service.changePhone(username, phoneNumber);
        } catch (error) {
            expect(error).toBeInstanceOf(HttpException);
            expect(error).toHaveProperty('message', 'Resend error');
        }
    });

    it('should resend confirmation code', async () => {
        const resendConfirmationResponse = {} as ResendConfirmationCodeCommandOutput;
        const username = 'test';
        jest.spyOn(Cognito, 'resendConfirmationCode').mockResolvedValueOnce(resendConfirmationResponse);
        expect(await service.resendConfirmationCode(username)).toStrictEqual(resendConfirmationResponse);
    });

    it('should register a new user', async () => {
        const attributes = { name: 'name', username: 'username', companyId: 2, integrationId: '1' };
        const company = { id: 1 } as Company;
        const user = { status: UserStatus.Active, company: { id: 1 } };
        const editCognitoUserResponse = {} as AdminGetUserCommandOutput;
        mockRepository.findOne.mockResolvedValueOnce(user);
        jest.spyOn(CompanyFunctions.prototype, 'hasFreeSeats').mockResolvedValueOnce(true);
        jest.spyOn(Cognito, 'adminEditCognitoUser').mockResolvedValueOnce(editCognitoUserResponse);
        mockRepository.save.mockResolvedValueOnce(user);
        expect(await service.registerUser(attributes, company)).toStrictEqual(user);
    });

    it(`should return the message 'User already exists'`, async () => {
        const attributes = { name: 'name', username: 'username', companyId: 1, integrationId: '1' };
        const company = { id: 1 } as Company;
        const user = { status: UserStatus.Active, company: { id: 1 } };
        const editCognitoUserResponse = {} as AdminGetUserCommandOutput;
        mockRepository.findOne.mockResolvedValueOnce(user);
        jest.spyOn(CompanyFunctions.prototype, 'hasFreeSeats').mockResolvedValueOnce(true);
        jest.spyOn(Cognito, 'adminEditCognitoUser').mockResolvedValueOnce(editCognitoUserResponse);
        mockRepository.save.mockResolvedValueOnce(user);
        try {
            expect(await service.registerUser(attributes, company));
        } catch (error) {
            expect(error).toBeInstanceOf(HttpException);
            expect(error).toHaveProperty('message', 'User already exists');
        }
    });

    it('should register users from CSV', async () => {
        const response = [];
        const file = { buffer: {} } as Express.Multer.File;
        const company = { id: 1 } as Company;
        const companyId = 1;
        mockRepository.findOne.mockResolvedValueOnce(company);
        expect(await service.registerUsers(file, companyId)).toStrictEqual(response);
    });

    it('should register users from CSV', async () => {
        const file = { buffer: {} } as Express.Multer.File;
        const company = { id: 1 } as Company;
        const companyId = 1;
        const user = {} as User;
        const registerUser = {} as IRegisterUser;
        mockRepository.findOne.mockResolvedValueOnce(company);
        jest.spyOn(csvToJson, 'csvStringToJson').mockResolvedValueOnce([registerUser]);
        jest.spyOn(UsersService.prototype, 'registerUser').mockResolvedValueOnce(user);
        expect(await service.registerUsers(file, companyId)).toStrictEqual([user]);
    });

    it(`should return the message 'User already exists'`, async () => {
        const attributes = { name: 'name', username: 'username', companyId: 1, integrationId: '1' };
        const company = { id: 1 } as Company;
        const user = { status: UserStatus.Active, company: { id: 1 } };
        mockRepository.findOne.mockResolvedValueOnce(user);
        jest.spyOn(CompanyFunctions.prototype, 'hasFreeSeats').mockResolvedValueOnce(false);
        try {
            expect(await service.registerUser(attributes, company));
        } catch (error) {
            expect(error).toBeInstanceOf(HttpException);
            expect(error).toHaveProperty('message', 'Company has achieved the seats limit');
        }
    });
});
