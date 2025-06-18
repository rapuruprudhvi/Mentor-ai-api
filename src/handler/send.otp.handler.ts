import { Request, Response } from 'express';
import { UserService } from '../service/user.service';
import { Injectable } from '../decorator/injectable.decorator';
import { RouteHandler } from '../types/handler';
import { ApiResponse } from '../types/api.responce';
import { OtpSchema, SendOtpSchema } from '../dto/auth.validation';

@Injectable()
export class SendOtpHandler implements RouteHandler {

  constructor(private userService: UserService) { }

  async handle(
    req: Request,
    res: Response<ApiResponse<SendOtpSchema>>,
  ) {
    const { email } = req.body;
  const result = await this.userService.sendOtp(email);
  return res.status(200).json({ data: result });
  }
}

