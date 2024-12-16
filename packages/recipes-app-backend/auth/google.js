const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User'); // Asegúrate de que el modelo de usuario esté correcto

// Configura el middleware de Passport con Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3000'}/auth/google/callback`,
    },    
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Buscar usuario por Google ID
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          // Crear un nuevo usuario si no existe
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
          });
        }
        return done(null, user); // Retorna el usuario autenticado
      } catch (err) {
        console.error('Error en GoogleStrategy:', err);
        return done(err, null);
      }
    }
  )
);

// Serialización/deserialización de usuario
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
