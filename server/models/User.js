import mongoose from 'mongoose';
import axios from 'axios';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';


dotenv.config();
const userSchema = new mongoose.Schema({
    authType: {
        type: String,
        enum: ['local', 'google'],
        required: true,
        default: 'local'
    },
    googleId: { type: String, unique: true, sparse: true },  // Only present for users who sign up with Google    
    username: { type: String, required: true, unique: true },
    firstname: { type: String, required: true, min: 2, max: 20 },
    lastname: { type: String, required: true, min: 2, max:20 },
    email: {
        type: String,
        required: true,
        unique: true,
        max: 50,
        match: [/\S+@\S+\.\S+/, 'is invalid'] // basic validation for email format
    },
    password: {
        type: String,
        required: false,
        validate: {
            validator: function(value) {
                const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
                return regex.test(value);
            },
            message: 'Password must have at least one uppercase letter, one lowercase letter, one special character, and be at least 8 characters long.'
        }
    },
    IsRetailVerified: { type: Boolean, required: false, default: false },
    permanentAddress: {
        street: { type: String, required: false },
        city: { type: String, required: false },
        state: { type: String, required: false },
        zip: { type: String, required: false },
        country: { type: String, required: false },
        coordinates: {  // This will store the geo-coordinates of the permanent address
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                index: '2dsphere',
                default: undefined
            }
        }
    },    
    phoneNumber: {
        type: String,
        required: false,
        default: '',
        validate: {
            validator: function(v) {
                // Only validate if the value is not an empty string
                return v === '' || /^\d{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },     
    ratings: { type: Number, required: false, default: 0 },
    worksAt: { type: String, required: false, default: '' },
    // you can make this a schema to keep track of all the companies in your website
    // or you should make it so there is a set list of stores that your web appp provides
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    //paystub picture and us state ID pictures needed
});

userSchema.pre('save', function(next) {
    const user = this;

    // Only hash the password if it has been modified (or is new)
    if (user.authType !== 'local' || !user.isModified('password')) return next();

    // Generate a salt
    bcrypt.genSalt(10, (err, salt) => {
        if (err) return next(err);

        // Hash the password using the salt
        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) return next(err);

            // Replace the plain-text password with the hashed one
            user.password = hash;
            next();
        });
    });
});

userSchema.pre('save', async function(next) {
    const user = this;

    if (user.IsRetailVerified && user.isModified('permanentAddress')) {
        const { street, city, state, zip, country } = user.permanentAddress;
        const fullAddress = `${street}, ${city}, ${state}, ${zip}, ${country}`;

        try {
            const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
            const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${GOOGLE_API_KEY}`);
            
            // Check if the response has results. If not, the address is likely invalid.
            if (response.data.results && response.data.results.length > 0) {
                const location = response.data.results[0].geometry.location;
                user.permanentAddress.coordinates.coordinates = [location.lng, location.lat];
            } else {
                console.warn("Invalid address provided:", fullAddress);
                // If you want to prevent save:
                next(new Error("Invalid address provided"));
            }
        } catch (error) {
            console.error("Geocoding error:", error.message);
            // If you don't want this error to halt the save operation, just call next() without the error:
            // next();
            
            // If you want to propagate the error:
            next(error);
        }
    } else {
        next();
    }
});



const User = mongoose.model('User', userSchema);
export default User;
