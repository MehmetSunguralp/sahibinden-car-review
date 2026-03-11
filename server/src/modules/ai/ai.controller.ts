import { Body, Controller, Post } from '@nestjs/common';
import { ParsedAdDetails } from '../../types/ad.types';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analyze-ad')
  analyzeAd(@Body() ad: ParsedAdDetails) {
    return this.aiService.analyzeAd(ad);
  }
}

