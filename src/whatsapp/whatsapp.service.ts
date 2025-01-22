import { Injectable, Logger, OnModuleInit, HttpException, HttpStatus } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';
import { UsersService } from '../users/users.service';

@Injectable()
export class WhatsappService implements OnModuleInit {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly SESSION_DIR = './data/.wwebjs_auth';
  private readonly TIMEOUT_SECONDS = 10; //  seconds
  private readonly STATES = {
    CONNECTED: 'CONNECTED',
    DISCONNECTED: 'DISCONNECTED',
    INITIALIZING: 'INITIALIZING'
  };

  constructor(private readonly usersService: UsersService) {}

  private qrCodes = new Map<string, string | null>();
  private clients = new Map<string, Client>();
  private clientStates = new Map<string, string>();

  
  async onModuleInit() {
    try {
      if (!fs.existsSync(this.SESSION_DIR)) {
        fs.mkdirSync(this.SESSION_DIR, { recursive: true });
      }
    } catch (error) {
      this.logger.error(`Failed to create session directory: ${error.message}`);
      throw new HttpException('Service initialization failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async initialize(userId: string) {
    if (!await this.validateUser(userId)) {
      throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST);
    }

    if (this.clients.has(userId)) {
      return;
    }

    try {
      this.clientStates.set(userId, this.STATES.INITIALIZING);
      const client = this.createClient(userId);
      await this.setupClient(client, userId);
      return this.getQrCode(userId);
    } catch (error) {
      this.clientStates.delete(userId);
      this.logger.error(`Failed to initialize client ${userId}: ${error.message}`);
      throw new HttpException('Failed to initialize WhatsApp client', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private createClient(userId: string): Client {
    return new Client({
      authStrategy: new LocalAuth({
        clientId: userId,
        dataPath: this.SESSION_DIR
      }),
      puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true
      }
    });
  }

  private async setupClient(client: Client, userId: string) {
    client.on('qr', async (qr) => {
      this.logger.log(`QR Code received for client ${userId}`);
      try {
        const url = await qrcode.toDataURL(qr);
        this.qrCodes.set(userId, url);
      } catch (error) {
        this.logger.error(`Failed to generate QR code: ${error.message}`);
      }
    });

    client.on('loading_screen', (percent, message) => {
      this.logger.log(`Loading screen for client ${userId}: ${percent}% - ${message}`);
    });

    client.on('ready', () => {
      this.logger.log(`Client ${userId} is ready`);
      this.qrCodes.set(userId, null);
      this.clientStates.set(userId, this.STATES.CONNECTED);
    });

    client.on('auth_failure', (msg) => {
      this.logger.error(`Authentication failed for client ${userId}: ${msg}`);
      this.cleanup(userId);
    });

    client.on('disconnected', (reason) => {
      this.logger.warn(`Client ${userId} disconnected. Reason: ${reason}`);
      this.clientStates.set(userId, this.STATES.DISCONNECTED);
    });

    try {
      this.logger.log(`Initializing client ${userId}...`);
      await client.initialize();
      this.logger.log(`Client ${userId} initialization completed`);
      this.clients.set(userId, client);
    } catch (error) {
      this.logger.error(`Failed to initialize client ${userId}: ${error.message}`);
      throw error;
    }
  }

  async ensureClientInitialized(userId: string): Promise<Client> {
    if (!this.clients.has(userId)) {
      await this.initialize(userId);
    }

    return this.waitForClientReady(userId);
  }

  private waitForClientReady(userId: string): Promise<Client> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const check = () => {
        const client = this.clients.get(userId);
        const elapsed = (Date.now() - startTime) / 1000;

        if (elapsed > this.TIMEOUT_SECONDS) {
          reject(new HttpException('Client initialization timeout', HttpStatus.REQUEST_TIMEOUT));
          return;
        }

        if (client && this.clientStates.get(userId) === this.STATES.CONNECTED) {
          resolve(client);
        } else {
          setTimeout(check, 200);
        }
      };

      check();
    });
  }

  async sendMessage(client: Client, to: string, message: string) {
    try {
      const response = await client.sendMessage(to, message);
      return { success: true, messageId: response.id.id };
    } catch (error) {
      this.logger.error(`Failed to send message: ${error.message}`);
      throw new HttpException('Failed to send message', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getClientStatus(client: Client) {
    try {
      const state = await client.getState();
      return { status: state };
    } catch (error) {
      this.logger.error(`Failed to get client status: ${error.message}`);
      throw new HttpException('Failed to get client status', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getQrCode(userId: string): Promise<string | null> {
    return this.qrCodes.get(userId) || null;
  }

  private cleanup(userId: string) {
    this.clients.delete(userId);
    this.qrCodes.delete(userId);
    this.clientStates.delete(userId);
  }

  async validateUser(userId: string): Promise<boolean> {
    const user = await this.usersService.findOne(Number(userId));
    return !!user;
  }
}
