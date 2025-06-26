import dotenv from 'dotenv'; // Для dotenv
dotenv.config();

const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;

import express from 'express';
import db from './db.js';    // Подключение базы данных
import { ApolloServer } from 'apollo-server-express';
import jwt from 'jsonwebtoken';

import models from './models/index.js';
import typeDefs from './schema.js';
import resolvers from './resolvers/index.js';

const getUser = token => {
  if (token) {
    try {
      // Возвращаем информацию пользователя из токена
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // Если с токеном возникла проблема, выбрасываем ошибку
      new Error('Session invalid');
    }
  }
};

// Старт сервера
async function startServer() {
    try {
        const app = express();
        const server = new ApolloServer({
            typeDefs,
            resolvers,
            context: ({req}) => {
              // Получаем токен пользователя из заголовков
              const token = req.headers.authorization;
              // Пытаемся извлечь пользователя с помощью токена
              const user = getUser(token);
              // Пока что будем выводить информацию о пользователе в консоль:
              console.log(user);
                return {models, user} // добавляем модели в контекст
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