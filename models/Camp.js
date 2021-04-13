let mongoose = require("mongoose");
const Review = require("./review");

let imageSchema = new mongoose.Schema({
  url: String,
  filename: String,
});

imageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_300");
});

let opts = { toJSON: { virtuals: true } };

let campSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: String,
    img: [imageSchema],
    price: Number,
    description: String,
    location: String,
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts
);

campSchema.virtual("properties.popup").get(function () {
  return `<a href='/campgrounds/${this._id}'>${this.title}</a>`;
});

campSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    console.log(doc);
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
    console.log(doc);
  }
});

let Camp = mongoose.model("Camp", campSchema);

module.exports = Camp;
