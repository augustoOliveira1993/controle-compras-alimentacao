const { MongoClient } = require('mongodb');
const { MongoMemoryReplSet } = require('mongodb-memory-server-core');
const { randomUUID } = require('node:crypto');
const { NestFactory } = require('@nestjs/core');
const request = require('supertest');
const { AppModule } = require('../dist/app.module.js');

test('publica a rota de saúde sob /api/v1', async () => {
  const app = await NestFactory.create(AppModule, { logger: false });
  try {
    app.setGlobalPrefix('api/v1');
    await app.init();
    await request(app.getHttpServer()).get('/api/v1/health').expect(200, { status: 'ok' });
  } finally {
    await app.close();
  }
});

test('confirma uma transação em uma base isolada no replica set', async () => {
  const local = process.env.TEST_MONGODB_URI ? undefined : await MongoMemoryReplSet.create({
    binary: { version: '8.0.16' },
    replSet: { name: 'rs0', count: 1, storageEngine: 'wiredTiger' },
  });
  const uri = local?.getUri() ?? process.env.TEST_MONGODB_URI;
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  await client.connect();
  const db = client.db('compras_teste_' + randomUUID().replaceAll('-', ''));
  try {
    await db.createCollection('movimentos');
    await client.withSession(session => session.withTransaction(async () => {
      await db.collection('movimentos').insertOne({ quantidade: 1 }, { session });
    }));
    expect(await db.collection('movimentos').countDocuments()).toBe(1);
  } finally {
    try { await db.dropDatabase(); } finally {
      await client.close();
      await local?.stop();
    }
  }
}, 240000);
