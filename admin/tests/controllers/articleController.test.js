const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../../server');
const Article = require('../../models/Article');
const authController = require('../../controllers/authController');

// Variables de test
const testArticle = {
  title: 'Test Article',
  content: 'This is a test article',
  category: 'news',
  featuredImage: 'test-image.jpg',
  status: 'published'
};

// Utilisateur de test
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'testpassword123'
};

// Token JWT pour l'authentification
let token;

// Configuration des tests
beforeAll(async () => {
  // Démarrer le serveur
  await app.listen(5000);
  
  // Créer un utilisateur de test
  const user = await authController.register({
    body: testUser
  });
  
  // Générer un token pour l'utilisateur
  token = user.token;
});

afterAll(async () => {
  // Fermer la connexion MongoDB
  await mongoose.connection.close();
});

describe('Article Controller Tests', () => {
  // Nettoyer les données avant chaque test
  beforeEach(async () => {
    await Article.deleteMany({});
  });

  // Créer un article
  test('should create a new article', async () => {
    const response = await request(app)
      .post('/api/articles')
      .set('Authorization', `Bearer ${token}`)
      .send(testArticle);

    expect(response.status).toBe(201);
    expect(response.body.title).toBe(testArticle.title);
  });

  // Obtenir tous les articles
  test('should get all articles', async () => {
    await Article.create(testArticle);
    
    const response = await request(app)
      .get('/api/articles');

    expect(response.status).toBe(200);
    expect(response.body.articles).toHaveLength(1);
  });

  // Obtenir un article spécifique
  test('should get a specific article', async () => {
    const article = await Article.create(testArticle);
    
    const response = await request(app)
      .get(`/api/articles/${article._id}`);

    expect(response.status).toBe(200);
    expect(response.body._id).toBe(article._id.toString());
  });

  // Mettre à jour un article
  test('should update an article', async () => {
    const article = await Article.create(testArticle);
    const updatedArticle = { ...testArticle, title: 'Updated Title' };
    
    const response = await request(app)
      .put(`/api/articles/${article._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedArticle);

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Updated Title');
  });

  // Supprimer un article
  test('should delete an article', async () => {
    const article = await Article.create(testArticle);
    
    const response = await request(app)
      .delete(`/api/articles/${article._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Article removed');
  });

  // Like un article
  test('should like an article', async () => {
    const article = await Article.create(testArticle);
    
    const response = await request(app)
      .post(`/api/articles/${article._id}/like`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  // Unlike un article
  test('should unlike an article', async () => {
    const article = await Article.create(testArticle);
    
    // D'abord like l'article
    await request(app)
      .post(`/api/articles/${article._id}/like`)
      .set('Authorization', `Bearer ${token}`);

    const response = await request(app)
      .post(`/api/articles/${article._id}/unlike`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  });
});
