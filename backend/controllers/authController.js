const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

// USER REGISTRATION HANDLER
// Creates new user account with encrypted password and JWT token
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // VALIDATE REQUIRED FIELDS
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // CHECK IF USER ALREADY EXISTS
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // HASH PASSWORD FOR SECURE STORAGE
    const hashedPassword = await bcrypt.hash(password, 10);

    // CREATE NEW USER IN DATABASE
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        username: true,
        email: true
      }
    });

    // GENERATE JWT TOKEN FOR IMMEDIATE LOGIN
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // VALIDATE REQUIRED FIELDS
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // FIND USER BY EMAIL
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // VERIFY PASSWORD AGAINST HASH
    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // GENERATE JWT TOKEN FOR AUTHENTICATION
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Logged in successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { register, login };
