import dotenv from 'dotenv'; // Для dotenv
dotenv.config();

import express from 'express';
import db from './db.js';    // Подключение базы данных
import models from './models/index.js';
import { ApolloServer, gql } from 'apollo-server-express';
const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;

// Данные
let notes = [
    { id: '1', title: 'Note 1', content: 'Hello World 1!', author: 'Testov' },
    { id: '2', title: 'Note 2', content: 'Hello World 2!', author: 'Test 1' },
    { id: '3', title: 'Note 3', content: 'Hello World 3!', author: 'Test 3' },
]

// Определим схему GraphQL

const typeDefs = gql`
    type Note {
        id: ID!,
        title: String!,
        content: String!,
        author: String!
    },
    type Query {
        hello: String!,
        notes: [Note!]!,
        note(id: ID!): Note!
    },
    type Mutation {
        newNote(content: String!): Note!
    }
`;

// Резолверы
const resolvers = {
    Query: {
        hello: () => 'Hello World',
        notes: async () => {
            return await models.Note.find();
        },
        note: async (parent, args) => {
            return await models.Note.findById(args.id);
        }
    },
    Mutation: {
        newNote: async (parent, args) => {
            return await models.Note.create({
                content: args.content,
                author: "Me"
            })
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