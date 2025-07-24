import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';
import { config } from '@/config/environment';
import { errorHandler } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { healthRouter } from '@/routes/health';
import { authRouter } from '@/routes/auth';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = config.PORT || 3001;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${config.NODE_ENV}`);
});

export { app };