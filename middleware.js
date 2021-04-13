let { campsSchema } = require("./schemas");
let campground = require("./models/Camp");
let review = require("./models/review");
let expressError = require("./utils/expressError");

module.exports.isloggedin = (req, res, next) => {
  // console.log(req.user);
  if (!req.isAuthenticated()) {
    req.session.toReturn = req.originalUrl;
    req.flash("error", "You must Log In First!!");
    return res.redirect("/login");
  }
  next();
};

module.exports.validated = (req, res, next) => {
  let { error } = campsSchema.validate(req.body);
  if (error) {
    let message = error.details.map((e) => e.message).join(".");
    throw new expressError(message, 401);
  } else {
    next();
  }
};

module.exports.isAuthor = async (req, res, next) => {
  var { id } = req.params;
  var camp = await campground.findById(id);
  if (!req.user._id.equals(camp.author._id)) {
    req.flash("error", "Not Allowed to edit Campground");
    return res.redirect("/campgrounds/" + id);
  }
  next();
};
module.exports.isrevAuthor = async (req, res, next) => {
  var { id, rid } = req.params;
  let rev = await review.findById(rid);
  if (!req.user._id.equals(rev.author._id)) {
    req.flash("error", "Not Allowed to delete Review");
    return res.redirect("/campgrounds/" + id);
  }
  next();
};
