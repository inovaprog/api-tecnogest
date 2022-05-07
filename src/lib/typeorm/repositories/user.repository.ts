import { IPaginationOptions, paginateRaw } from 'nestjs-typeorm-paginate';
import { EntityRepository, getRepository, Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@EntityRepository(User)
export class CustomUserRepository extends Repository<User> {
    async findPaginated(options: IPaginationOptions, query?: any) {
        const users = getRepository(User)
            .createQueryBuilder('user')
            .select('*');
        if (query) {
            for (const key in query) {
                if (Array.isArray(query[key])) {
                    users.andWhere(`user.${key} IN (:...${key})`, { [key]: query[key] });
                } else {
                    if (!isNaN(query[key])) users.andWhere(`user.${key} = :${key}`, { [key]: query[key] });
                    else users.andWhere(`user.${key} LIKE :${key}`, { [key]: `%${query[key]}%` });
                }
            }
        }
        return await paginateRaw(users, options);

    }
}
