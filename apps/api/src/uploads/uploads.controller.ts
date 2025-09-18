import { Controller, Post, UseInterceptors, UploadedFile, Body, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

function safeSlug(s: string) {
  return (s || '').toLowerCase().replace(/[^a-z0-9\-]+/g, '-').replace(/^\-+|\-+$/g, '');
}

@Controller('/v1/uploads')
export class UploadsController {
  constructor(private cfg: ConfigService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: (req, _file, cb) => {
        const base = process.env.UPLOAD_DIR!;
        const slug = safeSlug(req.body.softwareSlug || 'misc');
        const dest = path.join(base, 'software', slug);
        fs.mkdirSync(dest, { recursive: true });
        cb(null, dest);
      },
      filename: (_req, file, cb) => {
        const ts = Date.now();
        const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
        cb(null, `${ts}${ext}`);
      }
    }),
    limits: { fileSize: Number(process.env.MAX_IMAGE_MB || 8) * 1024 * 1024 }
  }))
  async upload(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    if (!file) throw new BadRequestException('No image uploaded');
    const slug = safeSlug(body.softwareSlug || 'misc');
    const publicBase = process.env.PUBLIC_UPLOAD_BASE!;
    const url = `${publicBase}/software/${slug}/${file.filename}`;
    return { ok: true, url };
  }
}
