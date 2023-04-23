import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { isUUID } from 'src/utils';
import { Repository } from 'typeorm';
import openai from './openai_config';

@Injectable()
export class AiService {
  USER_NOT_FOUND = 'User not found';
  INVALID_UUID = 'Invalid UUID';

  async getAiRes() {
    try {
      console.log('Getting AI response');
      const res = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: 'Say this is a test',
        temperature: 0,
        max_tokens: 7,
      });
      console.log('AI res:', res?.data?.choices[0]?.text);
      return res?.data?.choices[0]?.text;
    } catch (err) {
      console.log(err);
    }
  }
}
