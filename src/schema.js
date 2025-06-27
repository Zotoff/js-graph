import { gql } from 'apollo-server-express';

const typeDefs = gql`
  scalar DateTime
  
  type Note {
    id: ID!
    content: String!
    author: User!
    favoriteCount: Int!
    favoritedBy: [User!]
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Query {
    notes: [Note!]!
    note(id: ID!): Note!
    user(email: String!): User!
    me: User!
    users: [User!]!
  }

  type Mutation {
    newNote(content: String!): Note!,
    updateNote(id: ID!, content: String!): Note!
    deleteNote(id: ID!): Boolean!,
    signUp(username: String!, email: String!, password: String!): String!
    signIn(username: String, email: String, password: String!): String!
    toggleFavorite(id: ID!): Note!
  }

  type User {
    id: ID!
    username: String!
    email: String!
    avatar: String
    notes: [Note!]!
    favorites: [Note!]!
  }
  `;

export default typeDefs;

/* eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NWUzMGY0NTNhYThhNjkwMjM1NmNlYyIsImlhdCI6MTc1MTAwMzM4MH0.0wCud6HqS0Ps_zKStZWhMOjtjmXAYGY0LZSh8lIpAJo */