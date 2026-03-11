import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'node:fs';
import { connect } from 'puppeteer-real-browser';
import { parseSahibindenAdHtml } from '../utils/ad-html-parser.util';

@Injectable()
export class AdService {
  private readonly logger = new Logger(AdService.name);

  async crawlAd(adNo: string): Promise<void> {
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

      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-'); // NOSONAR - use regex replace for wide runtime compatibility
      const outputDir = 'formattedAds';
      const fileName = `ad-${adNo}-${timestamp}.json`;

      await fs.mkdir(outputDir, { recursive: true });
      await fs.writeFile(
        `${outputDir}/${fileName}`,
        JSON.stringify(parsed, null, 2),
        'utf8',
      );

      this.logger.log(`Saved formatted ad JSON to ${outputDir}/${fileName}`);
    } finally {
      await page.close();
      if (browser?.connected) {
        await browser.close();
      }
    }
  }
}
