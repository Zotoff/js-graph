import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';

const port = process.env.PORT || 4000;

// Определим схему GraphQL
const typeDefs = gql`
    type Query {
        hello: String
    }
`;

// Резолверы
const resolvers = {
    Query: {
        hello: () => 'Hello World',
    },
};

// Старт сервера
async function startServer() {
    try {
        const app = express();
        const server = new ApolloServer({
            typeDefs,
            resolvers,
        });

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