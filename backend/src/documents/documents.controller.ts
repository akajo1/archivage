import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

const uploadStorage = diskStorage({
  destination: './uploads',
  filename: (_req, file, cb) =>
    cb(null, `${Date.now()}${extname(file.originalname)}`),
});

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Get()
  findAll(
    @CurrentUser() user: { id: string; role: 'admin' | 'manager' | 'user' },
    @Query('badge_id') badge_id?: string,
    @Query('confidentiality_id') confidentiality_id?: string,
    @Query('search') search?: string,
  ) {
    return this.documentsService.findAll(user.id, user.role, {
      badge_id,
      confidentiality_id,
      search,
    });
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: 'admin' | 'manager' | 'user' },
  ) {
    return this.documentsService.findOne(id, user.role);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', { storage: uploadStorage }),
  )
  async create(
    @CurrentUser() user: { id: string; role: 'admin' | 'manager' | 'user' },
    @Body() dto: CreateDocumentDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const fileUrl = file ? `/uploads/${file.filename}` : undefined;
    return this.documentsService.create(user.id, user.role, dto, fileUrl);
  }

  @Post(':id/attachments')
  @UseInterceptors(
    FilesInterceptor('annexes', 20, { storage: uploadStorage }),
  )
  async addAttachments(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: 'admin' | 'manager' | 'user' },
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.documentsService.addAttachments(id, user.role, files ?? []);
  }

  @Delete(':id/attachments/:attachmentId')
  removeAttachment(
    @Param('id') id: string,
    @Param('attachmentId') attachmentId: string,
    @CurrentUser() user: { id: string; role: 'admin' | 'manager' | 'user' },
  ) {
    return this.documentsService.removeAttachment(id, attachmentId, user.role);
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('file', { storage: uploadStorage }),
  )
  update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: 'admin' | 'manager' | 'user' },
    @Body() dto: UpdateDocumentDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const fileUrl = file ? `/uploads/${file.filename}` : undefined;
    return this.documentsService.update(id, user.id, user.role, dto, fileUrl);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: 'admin' | 'manager' | 'user' },
  ) {
    return this.documentsService.remove(id, user.id, user.role);
  }
}
