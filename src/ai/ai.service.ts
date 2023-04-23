import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { isUUID } from 'src/utils';
import { Repository } from 'typeorm';

@Injectable()
export class AiService {
  USER_NOT_FOUND = 'User not found';
  INVALID_UUID = 'Invalid UUID';

  async getAiRes() {
    return 'Ai is thinking...';
  }
}
