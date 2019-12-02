const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const Admin = require("./app/models/admin.model");
const jwtSecretConfig = require("./config/jwt-secret.config");

passport.use(
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password"
        },
        function (email, password, cb) {
            console.log("on local stategy: ", email)
            // This one is typically a DB call.
            // Assume that the returned user object is pre-formatted and ready for storing in JWT
            return Admin.findOne({ email })
                .then(user => {
                    if (!user) {
                        return cb(null, false, { message: "Incorrect email or password." });
                    } else if (!user.validatePassword(password)) {
                        return cb(null, false, { message: "Incorrect email or password." });
                    }
                    return cb(null, user, { message: "Logged In Successfully" });
                })
                .catch(err => cb(err));
        }
    )
);

passport.use(
    new JWTStrategy(
        {
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtSecretConfig.jwtSecret
        },
        function (jwtPayload, cb) {
            return jwtPayload;
        }
    )
);
