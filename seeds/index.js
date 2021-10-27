const mongoose = require('mongoose')
const Campground=require('../models/campground')
const {places, descriptors} = require('./seedHelper')
const cities=require('./cities')

mongoose.connect('mongodb://localhost:27017/yelp-camp', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log('Database Connected');
    })
    .catch(err => {
        console.log(err);
        console.log("Database not Connected");
    })



const sample = array => array[Math.floor(Math.random()*array.length)];

const seedDB = async()=>{
    await Campground.deleteMany({});
    for(let i=0;i<50;i++){
        const random1000 = Math.floor(Math.random()*1000);
        const randomPrice = Math.floor(Math.random()*100) + 10;
        const camp = new Campground({
            author: '6178ffbc405bcab13eeefe46',
            title: `${sample(descriptors)}, ${sample(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            image: 'https://source.unsplash.com/collection/1114848',
            description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries.",
            price: randomPrice
        })
        camp.save()
    }
    console.log("Completed");
}

seedDB();