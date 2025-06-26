import dotenv from 'dotenv'; // Для dotenv
dotenv.config();

const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;

import express from 'express';
import db from './db.js';    // Подключение базы данных
import { ApolloServer } from 'apollo-server-express';

import models from './models/index.js';
import typeDefs from './schema.js';
import resolvers from './resolvers/index.js';

// Старт сервера
async function startServer() {
    try {
        const app = express();
        const server = new ApolloServer({
            typeDefs,
            resolvers,
            context: () => {
                return {models} // добавляем модели в контекст
            }
        });

        db.connect(DB_HOST);

        // Ждём, пока сервер стартует
        await server.start();

        // Теперь применяем middleware
        server.applyMiddleware({ app, path: '/api' });

        // Начинаем прослушивать порт
        app.listen(port, () => {
            console.log(`🚀 GraphQL Server ready at http://localhost:${port}/api`);
        });
    } catch (err) {
        console.error("Ошибка старта сервера:", err);
    }
}

startServer();