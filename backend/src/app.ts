// @ts-nocheck
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
dotenv.config();

import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import newsRoutes from './routes/news.routes';
import admissionRoutes from './routes/admission.routes';
import downloadRoutes from './routes/download.route';
import {
  announcementRouter, eventRouter, galleryRouter,
  gradeRouter, attendanceRouter,
  assignmentRouter, materialRouter,
  paymentRouter, bookRouter, borrowingRouter,
  userRouter, studentRouter, teacherRouter, dashboardRouter, auditLogRouter,
} from './routes/index';

const app = express();
const PORT = process.env.PORT || 5000;
const API = process.env.API_PREFIX || '/api/v1';


// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'http://localhost:3000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Disable HTTP 304 caching for real-time live API responses
app.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

app.use(compression());

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'SMP Darul Ulum API berjalan',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// ─── API ROUTES ───────────────────────────────────────────────────────────────
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/news`, newsRoutes);
app.use(`${API}/admissions`, admissionRoutes);
app.use(`${API}/downloads`, downloadRoutes);
app.use(`${API}/announcements`, announcementRouter);

app.use(`${API}/events`, eventRouter);
app.use(`${API}/gallery`, galleryRouter);
app.use(`${API}/grades`, gradeRouter);
app.use(`${API}/attendance`, attendanceRouter);
app.use(`${API}/assignments`, assignmentRouter);
app.use(`${API}/materials`, materialRouter);
app.use(`${API}/payments`, paymentRouter);
app.use(`${API}/books`, bookRouter);
app.use(`${API}/borrowings`, borrowingRouter);
app.use(`${API}/users`, userRouter);
app.use(`${API}/students`, studentRouter);
app.use(`${API}/teachers`, teacherRouter);
app.use(`${API}/dashboard`, dashboardRouter);
app.use(`${API}/audit-logs`, auditLogRouter);

// ─── ERROR HANDLERS ───────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── START ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🏫  SMP Darul Ulum Surabaya — API Server`);
  console.log(`🚀  Running  : http://localhost:${PORT}`);
  console.log(`📋  Prefix   : ${API}`);
  console.log(`🌍  Mode     : ${process.env.NODE_ENV || 'development'}\n`);
});

export default app;

// ─── START CRON JOBS ──────────────────────────────────────────────────────────
import { startAllCrons } from './utils/cron';
startAllCrons();
