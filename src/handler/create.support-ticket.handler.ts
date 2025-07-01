import { Request, Response } from 'express';
import { Injectable } from '../decorator/injectable.decorator';
import { RouteHandler } from '../types/handler';
import { UserService } from '../service/user.service';
import { ApiResponse } from '../types/api.responce';
import { createTicketSchema } from '../dto/auth.validation';
import { User } from '../entity/user.entity';
import { sendSupportTicketEmail } from '../utils/mail.utils';


@Injectable()
export class SupportTicketHandler implements RouteHandler {
  constructor(private readonly userService: UserService) { }

  async handle(req: Request, res: Response<ApiResponse<string>>) {
    const user = req.user as User;
    const { error, data } = createTicketSchema.safeParse(req.body);
    if (error) {
      return res.status(400).json({
        error: error.errors[0]?.message || 'Validation error',
      });
    }

    const ticket = await this.userService.createSupportTicket(data, user.id);
    if (ticket) {
      await sendSupportTicketEmail({ name: user.name, email: user.email }, ticket.id);
    }
    return res.status(201).json({
      data: 'Support ticket submitted successfully',
    });
  };

}