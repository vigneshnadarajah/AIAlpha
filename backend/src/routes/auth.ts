import { Router } from 'express';
import { AuthController } from '@/controllers/auth';
import { authenticateToken } from '@/middleware/auth';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/tenant', authController.createTenant);
router.post('/validate-schema-name', authController.validateSchemaName);

// Protected routes
router.post('/logout', authenticateToken, authController.logout);
router.get('/profile', authenticateToken, authController.getProfile);

export { router as authRouter };