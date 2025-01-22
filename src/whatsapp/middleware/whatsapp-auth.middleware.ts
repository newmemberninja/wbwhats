import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WhatsappService } from '../whatsapp.service';

@Injectable()
export class WhatsappAuthMiddleware implements NestMiddleware {
  constructor(private whatsappService: WhatsappService) { }

  async use(req: Request, res: Response, next: NextFunction) {
    const userId = req.params.userId;
    const user = await this.whatsappService.validateUser(userId);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const client = await this.whatsappService.ensureClientInitialized(userId);
    req['client'] = client;    
    next();
  }
}
