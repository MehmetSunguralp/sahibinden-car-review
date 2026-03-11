import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { connect } from 'puppeteer-real-browser';
import { parseSahibindenAdHtml } from '../../utils/ad-html-parser.util';
import { AiService } from '../ai/ai.service';

@Injectable()
export class AdService {
  private readonly logger = new Logger(AdService.name);

  constructor(private readonly aiService: AiService) {}

  async crawlAd(adNo: string): Promise<unknown> {
    const url = `https://www.sahibinden.com/kelime-ile-arama?query_text=${adNo}`;
    this.logger.log(`Opening page for ${adNo} -> ${url}`);

    const { browser, page } = await connect({
      headless: false,
      // fingerprint: true,
      turnstile: true,
      // tf: true,
    });

    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      // Give Cloudflare & dynamic content time to settle
      await new Promise((resolve) => setTimeout(resolve, 15000));
      this.logger.log(`Finished loading page for adNo=${adNo}`);

      const html = await page.content();
      const parsed = parseSahibindenAdHtml(html);

      const hasBasicData =
        parsed?.title &&
        parsed.priceText &&
        parsed.attributes &&
        Object.keys(parsed.attributes).length > 0;

      if (!hasBasicData) {
        this.logger.error(
          `Failed to scrape ad data for adNo=${adNo}. Parsed object looks incomplete.`,
        );
        throw new BadRequestException({
          ok: false,
          errorCode: 'SCRAPE_FAILED',
          message:
            'İlan verileri güvenilir şekilde çekilemedi. Lütfen ilanı tarayıcıdan manuel kontrol edin veya daha sonra tekrar deneyin.',
        });
      }

      const analysis = await this.aiService.analyzeAd(parsed);
      return analysis;
    } finally {
      await page.close();
      if (browser?.connected) {
        await browser.close();
      }
    }
  }
}
