const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server'); // Adjust the path as needed
const User = require('../src/models/User'); // Adjust the path as needed
const Task = require('../src/models/Task'); // Adjust the path as needed

describe('Tasks API', () => {
  let token;
  let userId;

  beforeAll(async () => {
    // Connect to a test database
    await mongoose.connect(process.env.MONGODB_URI_TEST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create a test user and get token
    const user = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123'
    });
    userId = user._id;
    token = user.generateAuthToken(); // Implement this method in your User model
  });

  afterAll(async () => {
    // Disconnect from the test database
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear the tasks collection before each test
    await Task.deleteMany({});
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Task',
          description: 'This is a test task',
          status: 'TODO'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('title', 'Test Task');
      expect(res.body).toHaveProperty('user', userId.toString());
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test Task',
          description: 'This is a test task',
          status: 'TODO'
        });

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('GET /api/tasks', () => {
    it('should return all tasks for the authenticated user', async () => {
      await Task.create([
        { title: 'Task 1', user: userId },
        { title: 'Task 2', user: userId }
      ]);

      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveLength(2);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update a task', async () => {
      const task = await Task.create({
        title: 'Task to update',
        user: userId
      });

      const res = await request(app)
        .put(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Task',
          status: 'IN_PROGRESS'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('title', 'Updated Task');
      expect(res.body).toHaveProperty('status', 'IN_PROGRESS');
    });

    it('should return 404 if task not found', async () => {
      const fakeId = mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Task'
        });

      expect(res.statusCode).toEqual(404);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      const task = await Task.create({
        title: 'Task to delete',
        user: userId
      });

      const res = await request(app)
        .delete(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Task deleted successfully');

      const deletedTask = await Task.findById(task._id);
      expect(deletedTask).toBeNull();
    });

    it('should return 404 if task not found', async () => {
      const fakeId = mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(404);
    });
  });
});