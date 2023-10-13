import User from '../models/User.js';
import bcrypt from 'bcrypt';
import axios from 'axios';
import passport from 'passport';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import dotenv from 'dotenv';

dotenv.config()

function generateRandomString(length = 5) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

export const setUpGoogleStrategy = () => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:6001/api/users/google/callback'
      },
      async (token, tokenSecret, profile, done) => {
        try {
            let user = await User.findOne({ googleId: profile.id });
            if (!user) {
                let username;
                let unique = false;
                while (!unique) {
                    // Generate a random username, e.g., JohnD_5g4s3
                    username = `${profile.name.givenName}${generateRandomString()}`;
    
                    // Check if this username already exists
                    const existingUser = await User.findOne({ username });
                    if (!existingUser) {
                        unique = true;
                    }
                }
    
                user = await User.create({
                    googleId: profile.id,
                    email: profile.emails[0].value,
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    authType: 'google',
                    username: username
                });
            }
            return done(null, user);
        } catch (err) {
            done(err);
        }
    }
    ));
  };


export const register = async (req, res) => {
    try {
        const { username, email, password, ...rest } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists!' });
        }

        // No need to hash the password manually here as it's done in the Mongoose middleware
        // Create a new user
        const user = await User.create({ username, email, password, ...rest });

        res.status(201).json(user);
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error.message });
    }
}


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found!' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Incorrect password!' });
        }

        // Token generation
        const token = jwt.sign(
            { userId: user._id, email: user.email }, // payload
            process.env.JWT_SECRET, // secret key
            { expiresIn: '1h' } // options: token expires in 1 hour
        );

        res.status(200).json({ token, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const nearbyUser = async (req, res) => {
    try {
        let { latitude, longitude, radius, address, zipcode, brands } = req.query;
        
        // Ensure at least one location-related parameter is provided
        if(!(latitude && longitude) && !address && !zipcode) {
            return res.status(400).json({ message: "Provide latitude/longitude or address or zipcode." });
        }

        // If latitude and longitude aren't directly provided, geocode address or zipcode
        if (!latitude || !longitude) {
            if(address) {
                ({ latitude, longitude } = await geocode(address));
            } else if(zipcode) {
                ({ latitude, longitude } = await geocode(zipcode));
            }
        }

        // Ensure we have both latitude and longitude after geocoding
        if(!latitude || !longitude) {
            return res.status(400).json({ message: "Couldn't determine location." });
        }

        let brandFilter = {};
        if (brands) {
            const brandArray = brands.split(',');  // Split by comma to get individual brands
            brandFilter = { 'worksAt': { $in: brandArray } };  // Query to match users that work at any of the specified brands
        }

        const nearbyUsers = await findUsersNearLocation(parseFloat(latitude), parseFloat(longitude), parseFloat(radius), brandFilter);
        console.log('nearby users:', nearbyUsers);
        res.json(nearbyUsers);
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error.message });
    }
}

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;


export async function geocode(AddZip) {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(AddZip)}&key=${GOOGLE_API_KEY}`);
    const locationData = response.data.results;
    if (!locationData.length) {
        throw new Error("No location data found for the provided input.");
    }
    const location = locationData[0].geometry.location;

    return {
        latitude: location.lat,
        longitude: location.lng
    };
}




async function findUsersNearLocation(latitude, longitude, radiusInMiles, brandFilter) {
    const radiusInRadians = radiusInMiles / 3959;

    const query = {
        "permanentAddress.coordinates": {
            $geoWithin: {
                $centerSphere: [[longitude, latitude], radiusInRadians]
            }
        },
        ...brandFilter  // Spread in the brand filter if it exists
    };

    const usersNearLocation = await User.find(query);
    return usersNearLocation;
}

export const verification = async (req, res) => {
    try {
        const userID = req.params.id;
        const {IsRetailVerified, permanentAddress, phoneNumber, worksAt} = req.body;
        
        // Find the user by ID
        const user = await User.findById(userID);

        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }

        user.IsRetailVerified = IsRetailVerified;
        if (user.IsRetailVerified) {
            // Assign each property of permanentAddress individually
            user.permanentAddress.street = permanentAddress.street;
            user.permanentAddress.city = permanentAddress.city;
            user.permanentAddress.state = permanentAddress.state;
            user.permanentAddress.zip = permanentAddress.zip;
            user.permanentAddress.country = permanentAddress.country;


            user.phoneNumber = phoneNumber;
            user.worksAt = worksAt;
        }

        await user.save();
        return res.status(200).json({ message: 'User updated successfully!' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error!' });
    }
};

export const googleCallback = (req, res) => {
    // Handle case when authentication fails and there's no user object
    if (!req.user) {
        return res.status(401).json({
            success: false,
            reason: "authentication_failed",
            message: "Authentication failed"
        });
    }

    // Handle successful authentication
    res.status(200).json({
        success: true,
        message: "Logged in successfully"
    });
};



export const setUsername = async (req, res) => {
    const { username } = req.body;
    const userId = req.user._id;

    // Validate username
    if (!username || username.length < 3) {
        return res.status(400).json({ reason: "invalid_username", message: "Username must be at least 3 characters long." });
    }

    try {
        // Check if the username is already taken
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ reason: "username_taken", message: "Username is already in use." });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, { username: username }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ reason: "user_not_found", message: "User not found." });
        }

        res.status(200).json({ message: "Username set successfully", user: updatedUser });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ reason: "internal_error", message: "Error setting username." });
    }
};