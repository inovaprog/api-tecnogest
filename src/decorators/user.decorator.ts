import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import DecodeToken from '../lib/decode-token';

export const UserFromSession = createParamDecorator((data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const token = request.headers.authorization;
    let user: any = {};
    if (token) {
        user = DecodeToken.decodeToken(token);
    }
    user.language = request.headers['accept-language'] || 'pt-br';
    return data ? user?.[data] : user;
});
