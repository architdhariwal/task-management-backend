const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server'); // Adjust the path as needed
const User = require('../src/models/User'); // Adjust the path as needed

describe('Authentication API', () => {
  beforeAll(async () => {
    // Connect to a test database
    await mongoose.connect(process.env.MONGODB_URI_TEST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    // Disconnect from the test database
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear the users collection before each test
    await User.deleteMany({});
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email', 'john@example.com');
    });

    it('should return 400 if email already exists', async () => {
      await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user and return a token', async () => {
      await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email', 'john@example.com');
    });

    it('should return 401 if credentials are invalid', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return user profile if authenticated', async () => {
      const user = await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      });

      const token = user.generateAuthToken(); // Implement this method in your User model

      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('email', 'john@example.com');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .get('/api/auth/profile');

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
  });
});