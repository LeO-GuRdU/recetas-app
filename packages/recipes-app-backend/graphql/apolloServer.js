const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');
const { graphqlUploadExpress } = require('graphql-upload');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

// Apply CORS middleware before any other middleware
app.use(cors({
  origin: 'http://localhost:4200',  // Ensure this is the correct origin (your frontend)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Ensure the correct methods are allowed
  credentials: true, // Allow cookies to be sent in requests
  allowedHeaders: ['Content-Type', 'Authorization', 'apollo-require-preflight'], // Ensure the correct headers are allowed
}));

// // Asegúrate de usar el middleware para gestionar uploads
// app.use(graphqlUploadExpress({
//   maxFileSize: 10000000,  // Max file size of 10 MB
//   maxFiles: 10,            // Only one file at a time
// }));

const createApolloServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    cors: false,
    uploads: false, // Deshabilita la opción uploads integrada de Apollo Server si usas graphql-upload.
    context: ({ req }) => {
      const token = req.cookies.token;
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
          return { userId: decoded.id };
        } catch (err) {
          console.error('Invalid token:', err);
        }
      }
      return {};
    },
  });

  await server.start();
  return server;
};

module.exports = createApolloServer;
