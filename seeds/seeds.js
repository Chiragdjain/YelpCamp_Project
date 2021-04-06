let mongoose=require('mongoose');
let Campground=require('../models/Camp');
let cities=require('./city');
console.log(cities[0].city)
const { places, descriptors } = require('./helper');
// let helper=require('./helper')
mongoose.connect('mongodb://localhost:27017/yelpCamp', {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we're connected!");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            //YOUR USER ID
            author: '6023c76d6cf391c850875608',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            img: [
            
                {
                    url: 'https://res.cloudinary.com/chiragjain55551/image/upload/v1613663290/YelpCamp/bnpcxivfmyunipvrm3as.jpg',
                    filename: 'YelpCamp/bnpcxivfmyunipvrm3as'
                },
                {
                  url: 'https://res.cloudinary.com/chiragjain55551/image/upload/v1613663290/YelpCamp/bnpcxivfmyunipvrm3as.jpg',
                  filename: 'YelpCamp/bnpcxivfmyunipvrm3as'
              },
            ]
        })
        await camp.save();
    }
}
seedDB();

