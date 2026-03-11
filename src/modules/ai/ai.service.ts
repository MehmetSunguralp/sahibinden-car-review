import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ParsedAdDetails } from '../../types/ad.types';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiKey = process.env.GROQ_API_KEY;

  async analyzeAd(ad: ParsedAdDetails): Promise<unknown> {
    if (!this.apiKey) {
      this.logger.error('Missing Groq configuration (GROQ_API_KEY).');
      throw new InternalServerErrorException('AI configuration is missing.');
    }

    const systemPrompt = [
      'Sen ikinci el araç ilanlarını analiz eden bir oto ekspertiz uzmanısın.',
      'Her zaman TÜRKÇE cevap ver.',
      '',
      'Sana aşağıda tek bir araç ilanına ait JSON verisi verilecek.',
      'Çıktı OLARAK SADECE aşağıdaki şemaya tam uyan bir JSON nesnesi döndür:',
      '',
      '{',
      '  "overallScore": number,                // 0–100 genel puan',
      '  "overallComment": string,              // 2–4 cümlede genel değerlendirme',
      '  "advantages": string[],                // Aracın güçlü yönleri, her biri kısa bir cümle',
      '  "disadvantages": string[],             // Zayıf yönler veya eksikler',
      '  "riskFlags": string[],                 // Dikkat edilmesi gereken somut riskler / uyarılar',
      '  "maintenanceSuggestions": string[],    // Bakım, kontrol veya pazarlık önerileri',
      '  "sections": {',
      '    "mileage": {',
      '      "title": string,                   // Örn: "Kilometre değerlendirmesi"',
      '      "comment": string,                 // 2–4 cümle; km neden iyi/kötü, hangi parçalar riskli',
      '      "score": number,                   // 0–100 sadece kilometre açısından puan',
      '      "riskLevel": "düşük" | "orta" | "yüksek"',
      '    },',
      '    "bodyAndPaint": {',
      '      "title": string,',
      '      "comment": string,                 // Boyalı/değişen olasılığı, özellikle nerelere bakılmalı',
      '      "riskLevel": "düşük" | "orta" | "yüksek"',
      '    },',
      '    "engineAndDrivetrain": {',
      '      "title": string,',
      '      "comment": string,                 // Motor, turbo, şanzıman, diferansiyel vb. muhtemel riskler',
      '      "riskLevel": "düşük" | "orta" | "yüksek"',
      '    },',
      '    "price": {',
      '      "title": string,',
      '      "comment": string,                 // Piyasa ile kıyas, km ve donanıma göre fiyat yorumu',
      '      "score": number,                   // 0–100 fiyat/performans puanı',
      '      "isCheap": boolean,                // Gerçekçi analizle ucuz mu?',
      '      "isOverpriced": boolean            // Gerçekçi analizle pahalı mı?',
      '    },',
      '    "listingQuality": {',
      '      "title": string,',
      '      "comment": string,                 // İlan açıklamasının detay seviyesi, güven verip vermediği',
      '      "score": number                    // 0–100 satıcının açıklığı/güvenilirliği',
      '    },',
      '    "buyRecommendation": {',
      '      "recommended": boolean,            // Genel olarak alınır mı?',
      '      "summary": string,                 // 2–4 cümlede net sonuç',
      '      "conditionsToBuy": string[],       // "Şu şartlarda alınabilir" maddeleri',
      '      "reasonsToAvoid": string[]         // "Şu durumlarda uzak dur" maddeleri',
      '    }',
      '  }',
      '}',
      '',
      'Kurallar:',
      '- Her alanı doldur; anlamlı bir şey yoksa bile boş liste veya nötr bir cümle kullan.',
      '- Metinlerde örnek verirken teknik ve net ol, ama gereksiz uzatma.',
      '- Özellikle kilometre, motor/şanzıman ve fiyat konularında somut örnekler ver (olası masraf kalemleri gibi).',
      '- Kesinlikle JSON dışında bir şey yazma (açıklama, markdown, yorum vb. yok).',
    ].join('\n');

    const userContent = JSON.stringify(ad, null, 2);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Araç ilanı JSON verisi:\n${userContent}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      this.logger.error(
        `Groq chat completion error: ${response.status} ${response.statusText} - ${errorText}`,
      );
      throw new InternalServerErrorException('Failed to get AI analysis.');
    }

    const completion: any = await response.json();
    const rawContent: string | undefined =
      completion?.choices?.[0]?.message?.content;

    if (!rawContent) {
      this.logger.error(`Groq response missing content: ${JSON.stringify(completion)}`);
      throw new InternalServerErrorException('AI response was malformed.');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawContent);
    } catch (err) {
      this.logger.error(
        `Failed to parse Groq JSON content: ${(err as Error).message}. Content=${rawContent}`,
      );
      throw new InternalServerErrorException('AI response was not valid JSON.');
    }

    this.logger.log(
      `Groq analysis completed for adNo=${
        (ad as any).attributes?.adNo ?? ad.id ?? 'unknown'
      } -> ${JSON.stringify(
        parsed,
        (key, value) => {
          if (typeof value === 'string' && value.length > 500) {
            return `${value.slice(0, 500)}...[truncated]`;
          }
          return value;
        },
      )}`,
    );

    return parsed;
  }
}
