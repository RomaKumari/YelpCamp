const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;



const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

const campgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
}, opts)

campgroundSchema.virtual('properties.popMarkup').get(function() {
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0,30)}...</p>`;
})
campgroundSchema.post('findOneAndDelete', async function(camp) {
    if (camp.reviews) {
        await Review.deleteMany({
            _id: { $in: camp.reviews }
        })
    }
})

module.exports = mongoose.model('Campground', campgroundSchema);