const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const { ApolloServer } = require('apollo-server-express');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const authRoutes = require('./routes/auth.routes');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const User = require('./models/User');
const cookieParser = require('cookie-parser');


// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: 'http://localhost:4200',  // Asegúrate de que aquí esté el origen correcto (tu frontend)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Asegúrate de que se permiten los métodos correctos
  credentials: true, // Permite que las cookies sean enviadas en las solicitudes
  allowedHeaders: ['Content-Type', 'Authorization'], // Asegúrate de que se permiten los encabezados correctos
}));
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB conectado'))
  .catch((err) => console.error('Error conectando a MongoDB:', err));

// Configuración de sesión
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secreto-secretito',
    resave: false,
    saveUninitialized: true,
  })
);

// Configuración de Passport
app.use(passport.initialize());
app.use(passport.session());

app.use(cookieParser());

// Configuración de Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3000'}/auth/google/callback`,
      scope: ['profile', 'email'], // Aquí estás pidiendo acceso al perfil y al email
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log('Google Profile:', profile); // Verificación del perfil de Google
      try {
        const user = await User.findOne({ googleId: profile.id });

        if (!user) {
          const newUser = new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
          });
          await newUser.save();
          return done(null, newUser);
        }

        return done(null, user); // Si el usuario ya existe, continuar
      } catch (err) {
        console.error('Error during Google authentication:', err);
        return done(err, null);
      }
    }
  )
);

// Serializar/Deserializar usuario
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Ruta de inicio
app.get('/', (req, res) => {
  res.send('Servidor funcionando');
});

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

      const token = jwt.sign({ id: data.createOrFindUser._id }, process.env.JWT_SECRET || 'default_secret', {
        expiresIn: '1d',
      });

      // Configurar la cookie con el token JWT
      res.cookie('token', token, {
        httpOnly: true, // La cookie no puede ser leída por JavaScript del cliente
        secure: false, // Cambiar a true en producción con HTTPS
        sameSite: 'strict', // Evita CSRF
        maxAge: 24 * 60 * 60 * 1000, // La cookie expirará en 1 día
      });

      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:4200'}?token=${token}`);
    } catch (err) {
      console.error('Error en la mutación de GraphQL:', err);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:4200'}?error=GraphQLMutationFailed`);
    }
  }
);

// Rutas adicionales
app.use('/api/auth', authRoutes);

// Middleware para verificar el token en las peticiones a /graphql
app.post('/graphql', (req, res, next) => {
  // Extraer el token de la cookie
  const token = req.cookies.token;  // Aquí tomamos el token de las cookies
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.id; // Extraer el userId del token
    } catch (err) {
      console.error('Token inválido:', err);
    }
  }
  next();
});

// Configuración de Apollo Server
const startServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    cors: {
      origin: 'http://localhost:4200',  // El frontend
      credentials: true,  // Permite el envío de cookies
    },
  });

  await server.start();
  server.applyMiddleware({ app, cors: false });

  // Iniciar el servidor
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
    console.log(`GraphQL ejecutándose en http://localhost:${PORT}/graphql`);
  });
};

startServer();
