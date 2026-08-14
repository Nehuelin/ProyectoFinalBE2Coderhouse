import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as JwTStrategy, ExtractJwt } from 'passport-jwt'
import { isValidPassword } from '../utils/hash.js'
import userService from '../services/user.service.js'
import usersRepository from '../repositories/users.repository.js'
import { isValidEmail, normalizeEmail } from '../utils/emailFunctions.js'


passport.use("register", new LocalStrategy({
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true,
    badRequestMessage: "Todos los campos son obligatorios"
  },

  async (req, incomingEmail, password, done) => {
    try {
      const {first_name, last_name} = req.body;

      if (!first_name || !last_name || !incomingEmail || !password) {
        return done(null, false, {statusCode: 400, message: "Todos los campos son obligatorios"});
      }

      const normalizedEmail = normalizeEmail(incomingEmail);

      if (!isValidEmail(normalizedEmail)) {
        return done(null, false, {statusCode: 400, message: "El formato del email no es válido"});
      }

      if (password.length < 8) {
        return done(null, false, {statusCode: 400, message: "La contraseña debe tener al menos 8 caracteres"});
      }

      const email = normalizedEmail;
      
      const newUser = await userService.registerUser({ first_name, last_name, email, password });

      return done(null, newUser);

    } catch (error) {
      
      if (error.message === "EMAIL_EXISTS"){
        return done(null, false, {statusCode: 409, message: "Ya existe un usuario registrado con ese email"});
      }

      return done(error);
    }
  }
));

passport.use("login", new LocalStrategy({
    usernameField: "email",
    passwordField: "password",
    badRequestMessage: "Email y contraseña son obligatorios"
  },

  async (email, password, done) => {
    try {
      const normalizedEmail = normalizeEmail(email);
  
      if (!isValidEmail(normalizedEmail)) {
        return done(null, false, {statusCode: 400, message: "El formato del email no es válido"})
      }
  
      const user = await usersRepository.getByEmail(normalizedEmail);
  
      if (!user){
        return done(null, false, {statusCode: 401, message: "Credenciales invalidas"});
      }
  
      const validPassword = await isValidPassword(password, user.password);
  
      if (!validPassword){
        return done(null, false, {statusCode: 401, message: "Credenciales invalidas"});
      }
  
      return done(null, user);

    } catch (error) {
      return done(error);
    }
  }
));

const cookieExtractor = (req) => {
  if(req && req.cookies && req.cookies.currentUser){
    return req.cookies.currentUser;
  }

  return null;
};

passport.use("current", new JwTStrategy({
    jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]), 
    secretOrKey: process.env.JWT_SECRET_KEY
  },

  async (payload, done) => {
    try {
      const user = await usersRepository.getById(payload.id);

      if (!user){
        return done(null, false);
      }

      return done(null, user);

    } catch (error) {
      return done(error);
    }
  }
));

export default passport;

