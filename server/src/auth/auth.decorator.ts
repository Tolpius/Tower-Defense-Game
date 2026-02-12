import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthPayload } from './jwt-auth.guard';

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthPayload | null => {
    const request = ctx.switchToHttp().getRequest();
    return request.user ?? null;
  },
);
