const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const configureExpress = (app) => {

  // Body parsing y cookies
  app.use(express.json());
  app.use(cookieParser());

  // Configuración de sesión
  app.use(session({
    secret: process.env.SESSION_SECRET || 'secreto-secretito',
    resave: false,
    saveUninitialized: true,
  }));
};

module.exports = configureExpress;
