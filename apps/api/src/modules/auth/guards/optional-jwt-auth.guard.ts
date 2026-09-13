import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(err: any, user: any): TUser {
    // Si hay error o no hay usuario, retornamos null sin lanzar UnauthorizedException
    return (user || null) as TUser;
  }
}
