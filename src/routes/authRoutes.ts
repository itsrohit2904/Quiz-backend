import express, { Router } from 'express';
import { registerUser, loginUser } from '../controllers/authController';

const router: Router = express.Router();

// POST request to register a new user
router.post('/register', registerUser);

// POST request to log in an existing user
router.post('/login', loginUser);

export default router;
