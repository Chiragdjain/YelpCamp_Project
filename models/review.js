let mongoose=require('mongoose');

let reviewSchema = new mongoose.Schema({
    author: {
        type : mongoose.Schema.Types.ObjectId,
        ref :  'User'
   },
    text:String,
    rating:Number
});

let Review = mongoose.model('Review',reviewSchema);

module.exports = Review;