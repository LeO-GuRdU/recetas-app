const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const passport = require('passport');
const { graphqlUploadExpress } = require('graphql-upload');
const configureExpress = require('./expressConfig');
const createApolloServer = require('./graphql/apolloServer');
const authRoutes = require('./routes/auth.routes');
const cors = require('cors');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const path = require('path');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: [
    "http://localhost:4200", // Frontend local
    "http://localhost:3000", // Para las peticiones a GraphQL
    "https://studio.apollographql.com" // Permite Apollo Studio
  ], 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Asegúrate de que se permiten los métodos correctos
  credentials: true, // Permite que las cookies sean enviadas en las solicitudes
  allowedHeaders: ['Content-Type', 'Authorization', 'apollo-require-preflight'], // Asegúrate de que se permiten los encabezados correctos
}));

// Asegúrate de usar el middleware para gestionar uploads
app.use(graphqlUploadExpress({
  maxFileSize: 10000000,  // Max file size of 10 MB
  maxFiles: 10,            // Only one file at a time
}));

// Servir el directorio estático para imágenes
app.use('/uploads', express.static(path.join(__dirname, 'graphql/uploads')));

// Configurar middlewares de Express
configureExpress(app);

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB conectado'))
  .catch((err) => console.error('Error conectando a MongoDB:', err));

// Configurar Passport (puedes separar esta configuración también si es necesario)
require('./auth/passportConfig');
const {generateToken} = require("./auth/jwt"); // Crea este archivo si quieres modularizar la configuración de Passport
app.use(passport.initialize());
app.use(passport.session());

// Rutas de autenticación con Google
app.get('/auth/google', (req, res, next) => {
  console.log('Redirigiendo a Google para autenticación...');
  next(); // Continuar con Passport.js
}, passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {  // Aquí agregamos 'async' para poder usar 'await'
    console.log('Callback recibido de Google...');

    if (!req.user) {
      console.log('Error: No user authenticated');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:4200'}?error=NoUser`);
    }

    console.log('Authenticated user:', req.user); // Verifica que el usuario esté autenticado

    // Continuar con la mutación de GraphQL si el usuario está autenticado
    const mutation = `
      mutation CreateOrFindUser($googleId: String!, $email: String!, $name: String!) {
        createOrFindUser(googleId: $googleId, email: $email, name: $name) {
          _id
          googleId
          email
          name
        }
      }
    `;
    console.log('GraphQL mutation:', mutation); // Verificar que la mutación esté correcta

    try {
      const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:3000'}/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: mutation,
          variables: {
            googleId: req.user.googleId,
            email: req.user.email,
            name: req.user.name,
          },
        }),
        credentials: 'include',
      });

      const { data } = await response.json();
      console.log('GraphQL response:', data); // Verificar la respuesta de GraphQL

      const token = generateToken(req.user); // Generar el token JWT con el usuario autenticado

      // Configurar la cookie con el token JWT
      res.cookie('token', token, {
        httpOnly: true, // La cookie no puede ser leída por JavaScript del cliente
        secure: false, // Cambiar a true en producción con HTTPS
        sameSite: "lax", // Permite cookies sin HTTPS en el mismo dominio
        maxAge: 24 * 60 * 60 * 1000, // La cookie expirará en 1 día
      });

      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:4200'}?token=${token}`);
    } catch (err) {
      console.error('Error en la mutación de GraphQL:', err);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:4200'}?error=GraphQLMutationFailed`);
    }
  }
);

// Rutas
app.use('/api/auth', authRoutes);
app.get('/', (req, res) => res.send('Servidor funcionando'));

// Inicializar Apollo Server
const startServer = async () => {
  const apolloServer = await createApolloServer();
  apolloServer.applyMiddleware({ app, cors: false });

  // Iniciar servidor Express
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
    console.log(`GraphQL ejecutándose en http://localhost:${PORT}/graphql`);
  });
};

startServer();
