// @ts-nocheck
import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError, sendNotFound } from '../utils/response';

const DEFAULT_GAMES = [
  {
    slug: 'tajwid',
    name: 'Tajwid & PAI Quest',
    icon: '☪️',
    subject: 'PAI',
    desc: 'Kuis Tajwid & hukum bacaan Al-Qur’an interaktif',
    color: 'from-emerald-600 to-teal-700',
    difficulty: 'Sedang',
    mode: 'adventure',
    played: 18,
    bestScore: 980,
    questions: [
      { question: 'Hukum bacaan Nun Sukun (نْ) bertemu dengan huruf Kho (خ) adalah...', options: ['Izhar Halqi', 'Idgham Bighunnah', 'Ikhfa Hakiki', 'Iqlab'], correct: 0, explanation: 'مِنْ خَوْفٍ — Izhar Halqi terjadi jika Nun Sukun / Tanwin bertemu 6 huruf halq: ء, هـ, ع, ح, غ, خ.', xpReward: 100 },
      { question: 'Hukum bacaan Nun Sukun (نْ) bertemu Ya (ي) adalah...', options: ['Idgham Bighunnah', 'Idgham Bilaghunnah', 'Izhar Syafawi', 'Ikhfa Hakiki'], correct: 0, explanation: 'مَنْ يَّعْمَلْ — Idgham Bighunnah dibaca melebur disertai dengung.', xpReward: 100 },
      { question: 'Hukum bacaan Nun Sukun (نْ) bertemu Ra (ر) adalah...', options: ['Idgham Bilaghunnah', 'Idgham Bighunnah', 'Iqlab', 'Izhar Halqi'], correct: 0, explanation: 'مِنْ رَّبِّهِمْ — Idgham Bilaghunnah dibaca melebur tanpa dengung.', xpReward: 100 },
      { question: 'Hukum bacaan Nun Sukun (نْ) bertemu Ba (ب) adalah...', options: ['Iqlab', 'Ikhfa Hakiki', 'Izhar Halqi', 'Idgham Bighunnah'], correct: 0, explanation: 'مِنْ بَعْدِ — Iqlab terjadi jika Nun Sukun bertemu Ba, suara nun diganti menjadi Mim (م).', xpReward: 100 },
      { question: 'Hukum bacaan Nun Sukun (نْ) bertemu Qaf (ق) adalah...', options: ['Ikhfa Hakiki', 'Izhar Halqi', 'Idgham Bilaghunnah', 'Iqlab'], correct: 0, explanation: 'مِنْ قَبْلِ — Ikhfa Hakiki dibaca samar-samar dengan dengung.', xpReward: 100 },
      { question: 'Hukum Mim Sukun (مْ) bertemu dengan Mim (م) adalah...', options: ['Idgham Mimi (Mitsli)', 'Ikhfa Syafawi', 'Izhar Syafawi', 'Izhar Halqi'], correct: 0, explanation: 'لَهُمْ مَّا يَشَاءُونَ — Idgham Mimi terjadi apabila Mim Sukun bertemu huruf Mim.', xpReward: 150 },
      { question: 'Hukum Mim Sukun (مْ) bertemu dengan Ba (ب) adalah...', options: ['Ikhfa Syafawi', 'Izhar Syafawi', 'Idgham Mimi', 'Iqlab'], correct: 0, explanation: 'تَرْمِيهِمْ بِحِجَارَةٍ — Ikhfa Syafawi terjadi apabila Mim Sukun bertemu huruf Ba.', xpReward: 150 },
      { question: 'Hukum Mim Sukun (مْ) bertemu Ta (ت) adalah...', options: ['Izhar Syafawi', 'Ikhfa Syafawi', 'Idgham Bighunnah', 'Iqlab'], correct: 0, explanation: 'أَلَمْ تَرَ كَيْفَ — Izhar Syafawi dibaca jelas tanpa dengung.', xpReward: 150 },
      { question: 'Berapakah jumlah rukun Islam dan rukun Iman secara berturut-turut?', options: ['5 dan 6', '6 dan 5', '5 dan 5', '6 dan 6'], correct: 0, explanation: 'Rukun Islam ada 5 perkara dan Rukun Iman ada 6 perkara.', xpReward: 150 },
      { question: 'Hukum Mad pada kata وَالسَّمَاءِ (Hamzah dalam satu kata) adalah...', options: ['Mad Wajib Muttashil', 'Mad Jaiz Munfashil', 'Mad Arid Lissukun', 'Mad Badal'], correct: 0, explanation: 'Mad Wajib Muttashil terjadi jika Mad Thabi’i bertemu Hamzah dalam satu kata (4-5 harakat).', xpReward: 200 },
      { question: 'Hukum Mad pada بِمَا أُنْزِلَ (Mad Thabi’i bertemu Hamzah di lain kata) adalah...', options: ['Mad Jaiz Munfashil', 'Mad Wajib Muttashil', 'Mad Iwadh', 'Mad Shilah'], correct: 0, explanation: 'Mad Jaiz Munfashil terjadi jika Mad Thabi’i bertemu Hamzah di kata terpisah.', xpReward: 200 },
      { question: 'Panjang hukum bacaan Mad Arid Lissukun di akhir ayat adalah...', options: ['2, 4, atau 6 Harakat', '1 Harakat saja', '8 Harakat', '3 Harakat saja'], correct: 0, explanation: 'الْعَالَمِينَ — Boleh dibaca 2, 4, atau 6 harakat.', xpReward: 200 }
    ]
  },
  {
    slug: 'vocab',
    name: 'Word & Concept Match',
    icon: '🧩',
    subject: 'IPA / Bahasa',
    desc: 'Cocokkan istilah dan definisi pelajaran!',
    color: 'from-indigo-500 to-purple-600',
    difficulty: 'Mudah',
    mode: 'match',
    played: 14,
    bestScore: 1050,
    questions: [
      { question: 'Photosynthesis', options: ['Proses pembuat makanan pada tumbuhan hijau'], correct: 0, explanation: 'Istilah Biologi Tumbuhan', xpReward: 150 },
      { question: 'Respiration', options: ['Proses pelepasan energi dari glukosa'], correct: 0, explanation: 'Istilah Biologi Respirasi', xpReward: 150 },
      { question: 'Linear Equation', options: ['Persamaan dengan variabel pangkat 1'], correct: 0, explanation: 'Istilah Aljabar Matematika', xpReward: 150 },
      { question: 'Majas Personifikasi', options: ['Gaya bahasa yang menganggap benda mati bernyawa'], correct: 0, explanation: 'Istilah Bahasa Indonesia', xpReward: 150 },
      { question: 'Narrative Text', options: ['Teks cerita rekaan untuk menghibur pembaca'], correct: 0, explanation: 'Istilah Bahasa Inggris', xpReward: 150 },
      { question: 'Proklamasi 1945', options: ['Peristiwa sejarah kemerdekaan Indonesia'], correct: 0, explanation: 'Istilah Sejarah IPS', xpReward: 150 },
      { question: 'Osmosis', options: ['Perpindahan molekul air melalui membran semipermeabel'], correct: 0, explanation: 'Istilah Fisika Biologi', xpReward: 150 },
      { question: 'Mitokondria', options: ['Organel sel tempat penghasil energi selular'], correct: 0, explanation: 'Istilah Biologi Sel', xpReward: 150 },
      { question: 'Pancasila', options: ['Dasar dan ideologi negara Republik Indonesia'], correct: 0, explanation: 'Istilah PPKn', xpReward: 150 },
      { question: 'Klorofil', options: ['Zat hijau daun penyerap energi cahaya matahari'], correct: 0, explanation: 'Istilah Biologi Tumbuhan', xpReward: 150 }
    ]
  },
  {
    slug: 'matematika',
    name: 'Math Blitz',
    icon: '⚡',
    subject: 'Matematika',
    desc: 'Jawab soal matematika sebelum waktu habis!',
    color: 'from-blue-500 to-indigo-600',
    difficulty: 'Sedang',
    mode: 'speed',
    played: 12,
    bestScore: 850,
    questions: [
      { question: 'Berapakah nilai x dari persamaan aljabar: 2x + 6 = 16 ?', options: ['x = 3', 'x = 5', 'x = 7', 'x = 9'], correct: 1, explanation: '2x = 16 - 6 => 2x = 10 => x = 5', xpReward: 50 },
      { question: 'Persamaan linear satu variabel dengan x = 4 adalah...', options: ['3x - 2 = 10', '2x + 4 = 10', '5x - 5 = 15', 'x + 8 = 10'], correct: 0, explanation: '3(4) - 2 = 12 - 2 = 10', xpReward: 50 },
      { question: 'Hasil dari 15 + (4 × 5) adalah...', options: ['35', '95', '40', '50'], correct: 0, explanation: 'Perkalian dikerjakan lebih dahulu: 4 × 5 = 20, 15 + 20 = 35', xpReward: 50 },
      { question: 'Berapakah 25% dari 200 ?', options: ['50', '25', '75', '100'], correct: 0, explanation: '25/100 × 200 = 50', xpReward: 50 },
      { question: 'Akar kuadrat dari 144 adalah...', options: ['12', '14', '16', '10'], correct: 0, explanation: '12 × 12 = 144', xpReward: 50 },
      { question: 'Hasil dari 3³ + 2² adalah...', options: ['31', '25', '35', '29'], correct: 0, explanation: '27 + 4 = 31', xpReward: 50 },
      { question: 'Hasil dari 1/2 + 1/4 adalah...', options: ['3/4', '2/6', '2/4', '1/6'], correct: 0, explanation: '2/4 + 1/4 = 3/4', xpReward: 50 },
      { question: 'Keliling persegi dengan panjang sisi 8 cm adalah...', options: ['32 cm', '64 cm', '16 cm', '24 cm'], correct: 0, explanation: 'Keliling = 4 × sisi = 4 × 8 = 32 cm', xpReward: 50 },
      { question: 'Luas segitiga dengan alas 10 cm dan tinggi 6 cm adalah...', options: ['30 cm²', '60 cm²', '16 cm²', '20 cm²'], correct: 0, explanation: 'Luas = 1/2 × alas × tinggi = 1/2 × 10 × 6 = 30 cm²', xpReward: 50 },
      { question: 'Berapakah hasil dari 5! (5 Faktorial)?', options: ['120', '60', '24', '100'], correct: 0, explanation: '5 × 4 × 3 × 2 × 1 = 120', xpReward: 50 }
    ]
  },
  {
    slug: 'scramble',
    name: 'Word Scramble',
    icon: '🔤',
    subject: 'B. Inggris',
    desc: 'Susun huruf jadi kata bahasa Inggris!',
    color: 'from-purple-500 to-violet-600',
    difficulty: 'Mudah',
    mode: 'speed',
    played: 8,
    bestScore: 1200,
    questions: [
      { question: 'Susun kata: E - D - U - C - A - T - I - O - N', options: ['EDUCATION', 'DEDICATION', 'EVALUATION', 'ELEVATION'], correct: 0, explanation: 'Artinya: Pendidikan', xpReward: 100 },
      { question: 'Susun kata: L - E - A - R - N - I - N - G', options: ['LEARNING', 'READING', 'WRITING', 'LISTENING'], correct: 0, explanation: 'Artinya: Pembelajaran', xpReward: 100 },
      { question: 'Susun kata: K - N - O - W - L - E - D - G - E', options: ['KNOWLEDGE', 'ACKNOWLEDGMENT', 'CHALLENGE', 'ADVANTAGE'], correct: 0, explanation: 'Artinya: Pengetahuan', xpReward: 100 },
      { question: 'Susun kata: S - C - H - O - O - L', options: ['SCHOOL', 'SCHOLAR', 'SCHEDULE', 'SCHEME'], correct: 0, explanation: 'Artinya: Sekolah', xpReward: 100 },
      { question: 'Susun kata: T - E - A - C - H - E - R', options: ['TEACHER', 'TRAINER', 'THEATER', 'TUTORIAL'], correct: 0, explanation: 'Artinya: Guru', xpReward: 100 },
      { question: 'Susun kata: S - T - U - D - E - N - T', options: ['STUDENT', 'STUDIO', 'STUDIED', 'STATION'], correct: 0, explanation: 'Artinya: Siswa', xpReward: 100 },
      { question: 'Susun kata: A - L - G - E - B - R - A', options: ['ALGEBRA', 'ANALOGY', 'ANALYTIC', 'ALGORITHM'], correct: 0, explanation: 'Artinya: Aljabar Matematika', xpReward: 100 },
      { question: 'Susun kata: B - I - O - L - O - G - Y', options: ['BIOLOGY', 'BOTANY', 'BIOCHEM', 'BIOGRAPHY'], correct: 0, explanation: 'Artinya: Ilmu Biologi', xpReward: 100 },
      { question: 'Susun kata: H - I - S - T - O - R - Y', options: ['HISTORY', 'HERITAGE', 'HARMONY', 'HIGHWAY'], correct: 0, explanation: 'Artinya: Sejarah', xpReward: 100 },
      { question: 'Susun kata: S - C - I - E - N - C - E', options: ['SCIENCE', 'SCENERY', 'SILENCE', 'SCENARIO'], correct: 0, explanation: 'Artinya: Sains / Ilmu Pengetahuan', xpReward: 100 }
    ]
  },
  {
    slug: 'memory',
    name: 'IPA Memory',
    icon: '🧬',
    subject: 'IPA',
    desc: 'Pasangkan istilah IPA dengan definisi!',
    color: 'from-green-500 to-emerald-600',
    difficulty: 'Sedang',
    mode: 'match',
    played: 5,
    bestScore: 640,
    questions: [
      { question: 'Klorofil', options: ['Zat hijau daun pengikat cahaya matahari'], correct: 0, explanation: 'Biologi Tumbuhan', xpReward: 100 },
      { question: 'Mitokondria', options: ['Organel sel penghasil energi selular'], correct: 0, explanation: 'Biologi Sel', xpReward: 100 },
      { question: 'Stomata', options: ['Celah mulut daun tempat pertukaran gas'], correct: 0, explanation: 'Anatomi Tumbuhan', xpReward: 100 },
      { question: 'Osmosis', options: ['Perpindahan molekul air melalui membran'], correct: 0, explanation: 'Fisika Biologi', xpReward: 100 },
      { question: 'Kapiler', options: ['Pembuluh darah terkecil penyuplai sel'], correct: 0, explanation: 'Sistem Peredaran Darah', xpReward: 100 },
      { question: 'Ribosom', options: ['Organel tempat sintesis protein dalam sel'], correct: 0, explanation: 'Biologi Sel', xpReward: 100 },
      { question: 'Enzim', options: ['Biokatalisator yang mempercepat reaksi kimia'], correct: 0, explanation: 'Biokimia', xpReward: 100 },
      { question: 'Phloem', options: ['Pembuluh pengangkut hasil fotosintesis'], correct: 0, explanation: 'Anatomi Tumbuhan', xpReward: 100 },
      { question: 'Xylem', options: ['Pembuluh pengangkut air dan hara dari akar'], correct: 0, explanation: 'Anatomi Tumbuhan', xpReward: 100 },
      { question: 'Nefron', options: ['Unit penyaring utama pada ginjal manusia'], correct: 0, explanation: 'Sistem Ekskresi', xpReward: 100 }
    ]
  },
  {
    slug: 'quiz-ipa',
    name: 'Science Quiz',
    icon: '🔭',
    subject: 'IPA',
    desc: 'Kuis sains interaktif dengan penjelasan!',
    color: 'from-teal-500 to-cyan-600',
    difficulty: 'Mudah',
    mode: 'speed',
    played: 15,
    bestScore: 920,
    questions: [
      { question: 'Organel sel yang berfungsi sebagai pusat energi sel adalah...', options: ['Mitokondria', 'Ribosom', 'Lisosom', 'Nukleus'], correct: 0, explanation: 'Mitokondria menghasilkan ATP energi sel.', xpReward: 100 },
      { question: 'Gas yang diserap tumbuhan saat fotosintesis adalah...', options: ['Karbondioksida (CO2)', 'Oksigen (O2)', 'Nitrogen (N2)', 'Hidrogen (H2)'], correct: 0, explanation: 'Tumbuhan menyerap CO2 dan merilis Oksigen.', xpReward: 100 },
      { question: 'Satuan internasional untuk mengukur arus listrik adalah...', options: ['Ampere', 'Volt', 'Ohm', 'Watt'], correct: 0, explanation: 'Arus listrik diukur dalam Ampere (A).', xpReward: 100 },
      { question: 'Planet terbesar dalam tata surya kita adalah...', options: ['Jupiter', 'Saturnus', 'Neptunus', 'Bumi'], correct: 0, explanation: 'Jupiter adalah planet terbesar di Tata Surya.', xpReward: 100 },
      { question: 'Urutan lapisan atmosfer terendah adalah...', options: ['Troposfer', 'Stratosfer', 'Mesosfer', 'Termosfer'], correct: 0, explanation: 'Troposfer tempat terjadinya fenomena cuaca.', xpReward: 100 },
      { question: 'Alat yang digunakan untuk mengukur getaran gempa bumi adalah...', options: ['Seismograf', 'Barometer', 'Termometer', 'Anemometer'], correct: 0, explanation: 'Seismograf mencatat gelombang seismik gempa.', xpReward: 100 },
      { question: 'Zat kimia perantara dalam pengiriman impuls sel saraf adalah...', options: ['Neurotransmitter', 'Hormon', 'Hemoglobin', 'Antibodi'], correct: 0, explanation: 'Neurotransmitter meneruskan sinyal di sinapsis.', xpReward: 100 },
      { question: 'Unsur kimia yang memiliki simbol Au pada tabel periodik adalah...', options: ['Emas (Gold)', 'Perak (Silver)', 'Aluminium', 'Argon'], correct: 0, explanation: 'Au berasal dari bahasa Latin Aurum (Emas).', xpReward: 100 },
      { question: 'Kecepatan cahaya di ruang hampa adalah sekitar...', options: ['300.000 km/detik', '150.000 km/detik', '500.000 km/detik', '1.000.000 km/detik'], correct: 0, explanation: 'Cahaya merambat ~3 × 10⁸ m/s.', xpReward: 100 },
      { question: 'Bagian mata yang berfungsi membias dan memfokuskan cahaya adalah...', options: ['Lensa Mata', 'Pupil', 'Retina', 'Kornea'], correct: 0, explanation: 'Lensa mata mengatur fokus pembiasan cahaya ke retina.', xpReward: 100 }
    ]
  },
  {
    slug: 'timeline',
    name: 'Sejarah Timeline',
    icon: '📅',
    subject: 'IPS',
    desc: 'Urutkan peristiwa sejarah Indonesia!',
    color: 'from-orange-500 to-amber-600',
    difficulty: 'Sulit',
    mode: 'speed',
    played: 6,
    bestScore: 780,
    questions: [
      { question: 'Tahun Proklamasi Kemerdekaan Republik Indonesia adalah...', options: ['1945', '1928', '1908', '1950'], correct: 0, explanation: 'Proklamasi dibacakan Ir. Soekarno pada 17 Agustus 1945.', xpReward: 100 },
      { question: 'Peristiwa Sumpah Pemuda dicetuskan pada tahun...', options: ['1928', '1908', '1945', '1912'], correct: 0, explanation: 'Kongres Pemuda II pada 28 Oktober 1928.', xpReward: 100 },
      { question: 'Peristiwa Rengasdengklok terjadi pada tanggal...', options: ['16 Agustus 1945', '17 Agustus 1945', '18 Agustus 1945', '15 Agustus 1945'], correct: 0, explanation: 'Penjelapan Soekarno-Hatta ke Rengasdengklok.', xpReward: 100 },
      { question: 'Kongres Pemuda Pertama dilaksanakan pada tahun...', options: ['1926', '1928', '1945', '1930'], correct: 0, explanation: 'Kongres Pemuda I di Batavia tahun 1926.', xpReward: 100 },
      { question: 'Berdirinya organisasi Budi Utomo pada tahun...', options: ['1908', '1912', '1928', '1945'], correct: 0, explanation: '20 Mei 1908 sebagai Hari Kebangkitan Nasional.', xpReward: 100 },
      { question: 'Peristiwa Bandung Lautan Api terjadi pada tahun...', options: ['1946', '1945', '1947', '1948'], correct: 0, explanation: '24 Maret 1946 di kota Bandung.', xpReward: 100 },
      { question: 'Konferensi Meja Bundar (KMB) dilaksanakan pada tahun...', options: ['1949', '1945', '1950', '1948'], correct: 0, explanation: 'Penyerahan kedaulatan RI di Den Haag 1949.', xpReward: 100 },
      { question: 'Sumpah Palapa diucapkan oleh Mahapatih Gajah Mada pada tahun...', options: ['1336', '1293', '1400', '1350'], correct: 0, explanation: 'Sumpah menyatukan Nusantara di Kerajaan Majapahit.', xpReward: 100 },
      { question: 'Deklarasi Djuanda yang menetapkan batas laut teritorial Indonesia dicetuskan tahun...', options: ['1957', '1945', '1960', '1950'], correct: 0, explanation: '13 Desember 1957 oleh PM Djuanda Kartawidjaja.', xpReward: 100 },
      { question: 'Peristiwa Pertempuran Surabaya terjadi pada tanggal...', options: ['10 November 1945', '17 Agustus 1945', '28 Oktober 1945', '10 Oktober 1945'], correct: 0, explanation: '10 November diperingati sebagai Hari Pahlawan.', xpReward: 100 }
    ]
  }
];

const seedFullGamesData = async () => {
  await prisma.elearningQuestion.deleteMany({});
  await prisma.elearningGame.deleteMany({});

  for (const g of DEFAULT_GAMES) {
    await prisma.elearningGame.create({
      data: {
        slug: g.slug,
        name: g.name,
        icon: g.icon,
        subject: g.subject,
        desc: g.desc,
        color: g.color,
        difficulty: g.difficulty,
        mode: g.mode,
        played: g.played,
        bestScore: g.bestScore,
        questions: {
          create: g.questions.map((q, idx) => ({
            question: q.question,
            options: q.options,
            correct: q.correct,
            explanation: q.explanation,
            xpReward: q.xpReward,
            order: idx + 1,
          })),
        },
      },
    });
  }
};

export const listGames = async (req: Request, res: Response) => {
  try {
    const totalQuestions = await prisma.elearningQuestion.count();
    if (totalQuestions < 60) {
      // Auto Seed/Re-seed full 70+ questions to PostgreSQL DB
      await seedFullGamesData();
    }

    const games = await prisma.elearningGame.findMany({
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    sendSuccess(res, games, 'Daftar game e-learning berhasil diambil');
  } catch (err) {
    sendError(res, 'Gagal mengambil daftar game e-learning');
  }
};

export const getGameBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    let game = await prisma.elearningGame.findUnique({
      where: { slug },
      include: {
        questions: { orderBy: { order: 'asc' } },
      },
    });

    if (!game || !game.questions || game.questions.length < 5) {
      await seedFullGamesData();
      game = await prisma.elearningGame.findUnique({
        where: { slug },
        include: { questions: { orderBy: { order: 'asc' } } },
      });
    }

    sendSuccess(res, game, 'Detail game berhasil diambil');
  } catch (err) {
    sendError(res, 'Gagal mengambil game');
  }
};

export const updateGame = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { subject, difficulty, questions } = req.body;

    const game = await prisma.elearningGame.findUnique({ where: { slug } });
    if (!game) {
      sendNotFound(res, 'Game tidak ditemukan');
      return;
    }

    // Update game details
    await prisma.elearningGame.update({
      where: { slug },
      data: {
        ...(subject && { subject }),
        ...(difficulty && { difficulty }),
      },
    });

    // Delete existing questions & recreate
    if (Array.isArray(questions)) {
      await prisma.elearningQuestion.deleteMany({ where: { gameId: game.id } });
      await prisma.elearningQuestion.createMany({
        data: questions.map((q: any, idx: number) => ({
          gameId: game.id,
          question: q.question,
          options: q.options || ['Opsi A', 'Opsi B', 'Opsi C', 'Opsi D'],
          correct: q.correct ?? 0,
          explanation: q.explanation || '',
          xpReward: q.xpReward || 100,
          order: idx + 1,
        })),
      });
    }

    const updatedGame = await prisma.elearningGame.findUnique({
      where: { slug },
      include: { questions: { orderBy: { order: 'asc' } } },
    });

    sendSuccess(res, updatedGame, 'Game dan soal berhasil diperbarui di Database!');
  } catch (err) {
    sendError(res, 'Gagal memperbarui game di Database');
  }
};

export const recordScore = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { score, studentName, userId } = req.body;

    const game = await prisma.elearningGame.findUnique({ where: { slug } });
    if (!game) {
      sendNotFound(res, 'Game tidak ditemukan');
      return;
    }

    const newPlayed = game.played + 1;
    const newBest = Math.max(game.bestScore, Number(score) || 0);

    // Update game stats in elearning_games table
    const updatedGame = await prisma.elearningGame.update({
      where: { slug },
      data: {
        played: newPlayed,
        bestScore: newBest,
      },
    });

    // Save individual attempt in elearning_scores table
    if (score !== undefined) {
      await prisma.elearningScore.create({
        data: {
          gameId: game.id,
          userId: userId || null,
          studentName: studentName || 'Siswa',
          score: Number(score) || 0,
        },
      });
    }

    sendSuccess(res, updatedGame, 'Skor game berhasil diperbarui di database');
  } catch (err) {
    sendError(res, 'Gagal mencatat skor game');
  }
};
