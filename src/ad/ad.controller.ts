import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { AdService } from './ad.service';

@Controller()
export class AdController {
  constructor(private readonly adService: AdService) {}

  @Get()
  async crawl(@Query('adNo') adNo?: string) {
    if (!adNo) {
      throw new BadRequestException('Missing adNo query parameter');
    }

    await this.adService.crawlAd(adNo);
    return { ok: true, adNo };
  }
}
