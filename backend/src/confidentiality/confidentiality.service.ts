import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConfidentialityService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.confidentiality.findMany();
  }
}
