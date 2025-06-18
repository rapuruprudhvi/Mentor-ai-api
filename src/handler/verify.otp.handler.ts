import { Request, Response } from 'express';
import { UserService } from '../service/user.service';
import { OtpSchema, otpSchema } from '../dto/auth.validation';
import { RouteHandler } from '../types/handler';
import { Injectable } from '../decorator/injectable.decorator';
import { ApiResponse } from '../types/api.responce';
import { logger } from '../config/logger.config';


@Injectable()
export class VerifyOtpHandler implements RouteHandler {
  constructor(private userService: UserService) { }

  async handle(req: Request, res: Response<ApiResponse<OtpSchema>>) {
    try {
      const { error, data: body } = otpSchema.safeParse(req.body);

      if (error) {
        logger.error(error.issues[0]?.message);
        return res.status(400).json({ error: "Bad Request" });
      }

      const { contact, otp } = body;
      const result = await this.userService.verifyOtp(contact, otp);
      if (!result) {
        return res.status(400).json({ error: 'Invalid OTP or contact' });
      }
      return res.status(200).json({ data: result });
    } catch (error) {
      return res.status(500).json({
        error: (error instanceof Error ? error.message : 'Internal server error'),
      });
    }
  }
}