// @ts-nocheck
import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendCreated, sendError, sendNotFound, parsePagination, buildPaginationMeta } from '../utils/response';
import { AuthRequest } from '../types';

export const listDownloads = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    // Auto-seed initial downloads if table is empty
    const count = await prisma.download.count({ where: { isActive: true } });
    if (count === 0) {
      const initialSeed = [
        {
          title: 'Formulir Pendaftaran & Berkas Fisik PPDB T.A. 2026/2027',
          description: 'Dokumen cetak formulir pendaftaran serta kelengkapan syarat berkas calon siswa baru.',
          category: 'Formulir PPDB',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          downloadCount: 340,
        },
        {
          title: 'Buku Panduan Tata Tertib & Kode Etik Siswa SMP Darul Ulum',
          description: 'Buku saku elektronik panduan disiplin, atribut seragam, dan aturan tata tertib siswa.',
          category: 'Panduan & Buku',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          downloadCount: 820,
        },
        {
          title: 'Dokumen Kalender Pendidikan Resmi Kota Surabaya 2026/2027',
          description: 'Kalender pendidikan resmi mengenai tanggal libur hari besar dan pekan efektif belajar.',
          category: 'Akademik',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          downloadCount: 1150,
        },
        {
          title: 'Surat Pernyataan Bebas Narkoba & Kesediaan Tatap Muka',
          description: 'Template surat pernyataan wali murid dan persetujuan tata tertib sekolah.',
          category: 'Administrasi Siswa',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          downloadCount: 290,
        },
      ];

      for (const item of initialSeed) {
        await prisma.download.create({ data: item });
      }
    }

    const [total, items] = await Promise.all([
      prisma.download.count({ where: { isActive: true } }),
      prisma.download.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    sendSuccess(res, items, 'Berkas unduhan berhasil diambil', 200, buildPaginationMeta(total, page, limit));
  } catch (err) {
    console.error('List downloads error:', err);
    sendError(res, 'Gagal mengambil berkas unduhan');
  }
};

export const createDownload = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, fileUrl } = req.body;
    if (!title || !fileUrl) {
      sendError(res, 'Judul dan URL file wajib diisi', 400);
      return;
    }

    const item = await prisma.download.create({
      data: {
        title,
        description: description || '',
        category: category || 'Dokumen',
        fileUrl,
        downloadCount: 0,
        isActive: true,
      },
    });

    sendCreated(res, item, 'Berkas unduhan berhasil ditambahkan');
  } catch (err) {
    console.error('Create download error:', err);
    sendError(res, 'Gagal menambah berkas unduhan');
  }
};

export const deleteDownload = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let existing = await prisma.download.findUnique({ where: { id } });

    if (!existing && (req.query.title || req.body?.title)) {
      const titleSearch = String(req.query.title || req.body?.title);
      existing = await prisma.download.findFirst({ where: { title: titleSearch } });
    }

    if (existing) {
      await prisma.download.delete({ where: { id: existing.id } });
    }

    sendSuccess(res, null, 'Berkas unduhan berhasil dihapus');
  } catch (err) {
    console.error('Delete download error:', err);
    sendError(res, 'Gagal menghapus berkas unduhan');
  }
};
