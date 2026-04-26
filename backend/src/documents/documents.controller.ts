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
import { FeaturePermissionGuard, FeaturePermission } from '../common/guards/feature-permission.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

const uploadStorage = diskStorage({
  destination: './uploads',
  filename: (_req, file, cb) =>
    cb(null, `${Date.now()}${extname(file.originalname)}`),
});

@UseGuards(JwtAuthGuard, RolesGuard, FeaturePermissionGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Get()
  @FeaturePermission({ feature: 'documents', operation: 'canRead' })
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
  @FeaturePermission({ feature: 'documents', operation: 'canRead' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: 'admin' | 'manager' | 'user' },
  ) {
    return this.documentsService.findOne(id, user.role);
  }

  @Post()
  @FeaturePermission({ feature: 'documents', operation: 'canEdit' })
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
  @FeaturePermission({ feature: 'documents', operation: 'canEdit' })
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
  @FeaturePermission({ feature: 'documents', operation: 'canDelete' })
  removeAttachment(
    @Param('id') id: string,
    @Param('attachmentId') attachmentId: string,
    @CurrentUser() user: { id: string; role: 'admin' | 'manager' | 'user' },
  ) {
    return this.documentsService.removeAttachment(id, attachmentId, user.role);
  }

  @Put(':id')
  @FeaturePermission({ feature: 'documents', operation: 'canEdit' })
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
  @FeaturePermission({ feature: 'documents', operation: 'canDelete' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: 'admin' | 'manager' | 'user' },
  ) {
    return this.documentsService.remove(id, user.id, user.role);
  }
}
