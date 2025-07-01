import { Request, Response } from 'express';
import { Injectable } from '../decorator/injectable.decorator';
import { RouteHandler } from '../types/handler';
import { UserService } from '../service/user.service';
import { ApiResponse } from '../types/api.responce';
import { SupportTicketViewResponse } from '../dto/auth.validation';
import { UlidIdSchema } from '../dto/id.validation';
import z from 'zod';

const ticketIdSchema = z.object({
  ticketId: UlidIdSchema,
});
@Injectable()
export class GetTicketHandler implements RouteHandler {
  constructor(private readonly userService: UserService) { }

  async handle(req: Request, res: Response<ApiResponse<SupportTicketViewResponse>>) {
    console.log(req.params)
    const { error, data: params } = ticketIdSchema.safeParse(req.params);
    if (error) {
      return res.status(400).json({ error: error.errors[0].message });
    }

    const result = await this.userService.getSupportTicketWithUser(params.ticketId);

    if (!result) {
      return res.status(404).json({ error: 'Ticket or user not found' });
    }
    return res.status(200).json({ data: result });
  };
}
