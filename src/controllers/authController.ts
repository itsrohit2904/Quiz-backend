import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/db';

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
      return;
    }

    // Hash the password
    const hashedPassword: string = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const result = await pool.query<User>(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    // Find the user in the database
    const userResult = await pool.query<User>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Invalid email or password'
      });
      return;
    }

    const user = userResult.rows[0];

    // Check if the password matches
    const validPassword: boolean = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(400).json({
        success: false,
        error: 'Invalid email or password'
      });
      return;
    }

    // Generate a JWT token
    const token: string = jwt.sign(
      { id: user.id },
      process.env.VITE_JWT_SECRET || 'rohit',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};