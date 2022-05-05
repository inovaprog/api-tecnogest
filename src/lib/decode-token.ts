import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import jwt_decode from 'jwt-decode';

export default class DecodeToken {
  private static readonly logger = new Logger(DecodeToken.name);
  static decodeToken(token: any): any {
    if (!token)
      throw new HttpException('Token is required', HttpStatus.BAD_REQUEST);
    try {
      token = token.replace('Bearer ', '');
      const decode = jwt_decode(token);
      return decode;
    } catch (error) {
      this.logger.error(`Failed to decode token. Error: ${error.message}.`);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
