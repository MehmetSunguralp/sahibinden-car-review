import { Injectable, Logger } from '@nestjs/common';
import { connect } from 'puppeteer-real-browser';

@Injectable()
export class AdService {
  private readonly logger = new Logger(AdService.name);

  async crawlAd(adNo: string): Promise<void> {
    const url = `https://www.sahibinden.com/kelime-ile-arama?query_text=${adNo}`;
    this.logger.log(`Opening page for adNo=${adNo} -> ${url}`);

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

      // NOTE: For now we only "open" the page.
      // Later you can inject an LLM client here to analyze the DOM/content.
    } finally {
      await page.close();
      if (browser && browser.isConnected()) {
        await browser.close();
      }
    }
  }
}
