import passport from '../config/passport.config.js';
import { HttpError } from '../utils/errors.js';

export const authenticate = (strategy, fallbackStatus, fallbackMessage) => (
  req,
  res,
  next,
) => {
  
  if(strategy === 'github'){
    return passport.authenticate(strategy, { scope: ["user:email"], session: false }, (error, user, info) => {
      
    if (error) {
      return next(error);
    }

    if (!user) {
      return next(new HttpError(
        info?.statusCode ?? fallbackStatus,
        info?.message ?? fallbackMessage,
      ));
    }

    req.user = user;
    return next();
    })(req, res, next);
  }

  passport.authenticate(strategy, { session: false }, (error, user, info) => {
    if (error) {
      return next(error);
    }

    if (!user) {
      return next(new HttpError(
        info?.statusCode ?? fallbackStatus,
        info?.message ?? fallbackMessage,
      ));
    }

    req.user = user;
    return next();
  })(req, res, next);
};