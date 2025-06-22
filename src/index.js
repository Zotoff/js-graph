import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';

const port = process.env.PORT || 4000;

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
        notes: () => notes,
        note: (parent, args) => {
            return notes.find(note => note.id === args.id);
        }
    },
    Mutation: {
        newNote: (parent, args) => {
            let note = {
                id: notes.length + 1,
                title: 'New Note',
                content: args.content,
                author: 'Unknown'
            };
            notes.push(note);
            return note;
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