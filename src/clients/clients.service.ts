import { WhatsappService } from './../whatsapp/whatsapp.service';
import { Injectable } from '@nestjs/common';

interface ClientData {
  id: string;
  name: string;
  status: 'active' | 'inactive';
}

@Injectable()
export class ClientsService {
  private clients: Map<string, ClientData> = new Map();


  async getClients() {
    return Array.from(this.clients.values());
  }


}
