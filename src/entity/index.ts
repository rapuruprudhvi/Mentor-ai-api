import { BlacklistedToken } from "./blacklisted-token.entity";
import { Interview } from "./interview.entity";
import { InterviewSession } from "./interview.session.entity";
import { InterviewPrompt } from "./InterviewPrompt";
import { Payment } from "./payment.entity";
import { SupportTicket } from "./support.ticket.entity";
import { User } from "./user.entity";


export const entities = [ User, BlacklistedToken, Interview, Payment,InterviewPrompt, InterviewSession, SupportTicket];
