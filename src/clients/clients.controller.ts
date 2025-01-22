import { Controller, Get, Post } from '@nestjs/common';
import { ClientsService } from './clients.service';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}



  @Get()
  async getClientss(): Promise<any[]>{
    return await this.clientsService.getClients();
  }


  
}
