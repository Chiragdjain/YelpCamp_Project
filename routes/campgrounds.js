let express = require('express');
let router = express.Router();
let campground=require('../models/Camp');
let review = require("../models/review");
let catchAsync=require('../utils/catchAsync') ;
let expressError = require('../utils/expressError')
let { campsSchema } = require('../schemas')
let { isloggedin } = require('../middleware');
let { validated , isAuthor }=require('../middleware')
var storage = require('../cloudinary')
var multer  = require('multer')
var upload = multer( storage );
var { cloudinary }=require('../cloudinary')
var mbxgeocoding=require('@mapbox/mapbox-sdk/services/geocoding')
var token=process.env.MAP_T
var geocodingClient=mbxgeocoding({accessToken:token})

// geocodingClient.forwardGeocode({
//     query: 'Mumbai,India',
//     limit: 1
//   })
//     .send()
//     .then(response => {
//       const match = response.body;
//       console.log(match.features[0].geometry.coordinates)
//     });


router.get("/", catchAsync(  async (req,res) => {
    var campgrounds = await campground.find() ;
    res.render("campgrounds" , { campgrounds });
}))

router.get("/new", isloggedin ,(req,res) => {
    res.render("form");
})

// router.post("/",upload.array('image'),(req,res)=>{
//     console.log(req.body,req.files)
//     res.send(req.body,req.files);
// })

router.post("/", isloggedin , upload.array('image') , validated , catchAsync( async (req,res,next) => {

    var place=await geocodingClient.forwardGeocode({
        query: camp.location,
        limit: 1
      }).send()
    //   console.log(place.body.features[0].geometry)

      
    var camp=req.body.camps;  
    var newcamp = await new campground(camp);


    camp.img=req.files.map( f => ({ url:f.path , filename:f.filename}))
    newcamp.geometry = place.body.features[0].geometry;
    camp.author=req.user;


    newcamp.save();
    // console.log(newcamp)
    req.flash('success','Successfully Created Campground');
    res.redirect("/campgrounds");
    
}))

router.get("/:id", catchAsync( async (req,res,next) => {
        var { id } = req.params; 
        var camp = await campground.findById(id).populate({
            path:'reviews',
            populate:{
                path:'author'
            }
        }).populate('author') ;
        // console.log(camp)
        if(!camp){
            req.flash('error','Campground Not Found');
            res.redirect("/campgrounds");
            // return next(new expressError('Page Not Found',401));
        }
        res.render("showcampground" , { camp });

    }))

router.get("/:id/edit", isloggedin,isAuthor  ,catchAsync( async (req,res) => {

    var { id } = req.params; 
    var camp = await campground.find({_id : id}) ;
    if(!camp){
        req.flash('error','Campground Not Found');
        res.redirect("/campgrounds");
        // return next(new expressError('Page Not Found',401));
    }
    res.render("formedit" , { camp });
}))

router.put("/:id", isloggedin,isAuthor, upload.array('image')  ,validated , catchAsync(async (req,res) => {
    var { id } = req.params; 
    // console.log(req.body)
    var camp1=req.body.camps;
    var camp = await campground.findById(id);
    if(!camp){
        req.flash('error','Campground Not Found');
        res.redirect("/campgrounds");
    }
   
    let camp2 = await campground.findByIdAndUpdate(id,camp1);
    let imgs=req.files.map( f => ({ url:f.path , filename:f.filename}))
    camp2.img.push(...imgs);
    if(req.body.deleteImages){

        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename)
        }

        await camp2.updateOne({$pull: { img: { filename : { $in : req.body.deleteImages} }}})
        // console.log(camp2)
    }
    camp2.save();
    req.flash('success','Successfully Edited Campground');
    res.redirect("/campgrounds/"+id);
}))

router.delete("/:id",isloggedin , isAuthor, catchAsync(async (req,res) => {

    var { id } = req.params; 
    var camp = await campground.findByIdAndDelete(id) ;
    req.flash('success','Successfully Deleted Campground');
    res.redirect("/campgrounds");
}))









module.exports = router ;