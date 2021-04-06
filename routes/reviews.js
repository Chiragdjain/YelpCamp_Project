let express = require('express');
let router = express.Router({mergeParams:true});
let campground=require('../models/Camp');
let review = require("../models/review");
let catchAsync=require('../utils/catchAsync') ;
let expressError = require('../utils/expressError')
let { reviewSchema } =require('../schemas')

let { isloggedin } = require('../middleware');
let { validated , isAuthor , isrevAuthor}=require('../middleware')

let validatereview = (req,res,next) => {
    let { error } = reviewSchema.validate(req.body);
    // console.log(error)
    if(error){
        let message = error.details.map( e => e.message).join('.')
        throw new expressError(message,401);
    } else {
        next();
    }

}


router.post("/",isloggedin, validatereview ,catchAsync(async (req,res) => {
    let {id} = req.params ;
    let camp= await campground.findById(id)
    let r=req.body.reviews;
    r.author=req.user._id;
    let rev = await new review(r);
    await camp.reviews.push(rev);
    rev.save();
    camp.save();
    req.flash('success',"Successfully Created Review")
    res.redirect("/campgrounds/"+id);
}))



router.delete("/:rid",isloggedin,isrevAuthor,catchAsync(async (req,res) => {
    let {id,rid} = req.params ;
    let camp= await campground.findByIdAndUpdate(id,{ $pull : { reviews : rid}})
    let rev = await review.findByIdAndDelete(rid);
    // console.log(camp,rev);
    // await camp.reviews.findByIdAndDelete(rid);
    camp.save();
    req.flash('success','Deleted review');
    res.redirect("/campgrounds/"+id);
    
}));

module.exports = router