import { Module } from '@nestjs/common';
import { AdModule } from './ad/ad.module';

@Module({
  imports: [AdModule],
})
export class AppModule {}
