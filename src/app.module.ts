import { Module } from '@nestjs/common';
import { AdModule } from './modules/ad/ad.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [AdModule, AiModule],
})
export class AppModule {}
