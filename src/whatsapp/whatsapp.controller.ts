import { Controller, Get, Post, Body, Res, HttpStatus, Req } from '@nestjs/common';
import { Response } from 'express';
import { WhatsappService } from './whatsapp.service';
import { SendMessageDto } from './dto/message.dto';
import { UserId } from './decorators/user-id.decorator';

@Controller('whatsapp/:userId')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) { }


  @Post('init')
  async initialize(@UserId() userId: string, @Res() res: Response) {
    await this.whatsappService.initialize(userId);
    const qrCode = await this.whatsappService.getQrCode(userId);
    if (!qrCode) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: 'QR code not found Or client is Already initialized' });
    }
    const img = Buffer.from(qrCode.split(',')[1], 'base64');
    res.setHeader('Content-Type', 'image/png');
    res.send(img);
  }

  @Get('qr')
  async getQrCode(@UserId() userId: string, @Res() res: Response) {
    const qrCode = await this.whatsappService.getQrCode(userId);
    if (!qrCode) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: 'QR code not found' });
    }
    const img = Buffer.from(qrCode.split(',')[1], 'base64');
    res.setHeader('Content-Type', 'image/png');
    res.send(img);
  }

  @Get('status')
  async getStatus(@Req() req: Request, @Res() res: Response) {
    const status = await this.whatsappService.getClientStatus(req['client']);
    res.status(HttpStatus.OK).json(status);
  }

  @Post('send')
  async sendMessage(
    @Body() messageDto: SendMessageDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const result = await this.whatsappService.sendMessage(
      req['client'],
      messageDto.to,
      messageDto.message,
    );
    res.status(HttpStatus.OK).json(result);
  }
}