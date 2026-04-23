import { Controller, Get, UseGuards } from '@nestjs/common';
import { ConfidentialityService } from './confidentiality.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('confidentiality')
export class ConfidentialityController {
  constructor(private confidentialityService: ConfidentialityService) {}

  @Get()
  findAll() {
    return this.confidentialityService.findAll();
  }
}
