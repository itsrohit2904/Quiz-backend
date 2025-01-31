import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';  // Update if necessary based on the actual location of the file
import pool from './db/db';  // Import the pool to ensure the database connection is established

dotenv.config();  // Load environment variables from .env file

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Use the routes for authentication
app.use('/api/auth', authRoutes);

// Test the connection
pool.connect()
   .then(() => console.log('Connected to PostgreSQL'))
  .catch((err) => console.error('Error connecting to PostgreSQL', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
