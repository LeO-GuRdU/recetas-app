const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const cookieParser = require('cookie-parser');
const app = express();

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
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            avatarUrl: profile.photos[0].value, // Save the avatar URL
          });
          await user.save();
        } else if (!user.avatarUrl) {
            user.avatarUrl = profile.photos[0].value;
            await user.save();
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