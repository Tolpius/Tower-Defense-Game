import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthDto } from './dto/google-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  async googleLogin(@Body() body: GoogleAuthDto) {
    const user = await this.authService.verifyGoogleToken(body.credential);
    const accessToken = await this.authService.issueJwt(user);

    return {
      access_token: accessToken,
      user,
    };
  }
}
