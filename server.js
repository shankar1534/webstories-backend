const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');
const cors = require('cors'); 

dotenv.config();

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const imageSchema = new mongoose.Schema({
    name: String,
    description: String,
    url: String,
});

const Image = mongoose.model('Image', imageSchema);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Multer configuration for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// Create 'uploads' directory if it doesn't exist
const dir = './uploads';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

// POST route to upload image
app.post('/upload', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const { name, description } = req.body;

    const image = new Image({ name, description, url: imageUrl });
    await image.save();

    res.send({ message: 'Image uploaded successfully!', url: imageUrl });
});

app.get('/images', async (req, res) => {
    try {
        const images = await Image.find();
        res.json(images); 
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch images' });
    }
});

app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
