if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
console.log(process.env.secret);

let express = require("express");
let app = express();
let ejsMate = require("ejs-mate");
let mongoose = require("mongoose");
let mO = require("method-override");
let flash = require("connect-flash");
let session = require("express-session");
let expressError = require("./utils/expressError");
let campgrounds = require("./routes/campgrounds");
let reviews = require("./routes/reviews");
let users = require("./routes/user");
let passport = require("passport");
let passportLocal = require("passport-local");
let User = require("./models/User");
const mongoSanitize = require("express-mongo-sanitize");

const dburl = "mongodb://localhost:27017/yelpCamp";
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(mO("_method"));
app.use(express.static(__dirname + "/public"));

mongoose.connect(dburl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("we're connected!");
});

let sessionConfig = {
  secret: "Jagdambe",
  saveUninitialized: true,
  resave: false,
};
app.use(session(sessionConfig));

app.use(mongoSanitize());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());
app.use((req, res, next) => {
  // console.log(req.session)
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/", users);
app.use("/campgrounds", campgrounds);
app.use("/campgrounds/:id/reviews", reviews);

app.get("/", (req, res) => {
  res.render("home");
});

// app.all('*', (req,res,next) => {
//     return next(new expressError('Cannot found Page',404))
// })

app.get("/fakeuser", async (req, res) => {
  let user = await new User({ email: "chirag@gmail.com", username: "Chirag" });
  let newUser = await User.register(user, "jagdambe");
  res.send(newUser);
});

app.use((err, req, res, next) => {
  let { status = 500 } = err;
  if (!err.message) err.message = "Oh No!! Something went wrong";
  res.status(status).render("error", { err });
});

app.listen(3000, () => {
  console.log("from 3000 port");
});
