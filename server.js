const axios = require('axios');
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3000;

// // MySQL connection
// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '2005@',
//     database: 'userDB',
// });

// db.connect(err => {
//     if (err) throw err;
//     console.log('✅ Connected to MySQL!');
// });

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Hugging Face inference endpoint
const HUGGING_FACE_API = 'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-dev';
const HF_TOKEN = process.env.HUGGINGFACE_TOKEN;

app.post('/generate-logo', async (req, res) => {
    const { companyType, companyName, description } = req.body;

    if (!companyType || !companyName || !description) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const prompt = `A high-resolution logo design for a company named "${companyName}" in the "${companyType}" industry. 
The logo should feature the company name "${companyName}" as part of the design. 
Use a ${description || 'clean, modern, minimal, and professional'} visual style. 
Design should be centered, brand-focused, and presented on a white background.`;

    try {
        const response = await axios.post(
            HUGGING_FACE_API,
            { inputs: prompt },
            {
                headers: {
                    Authorization: `Bearer ${HF_TOKEN}`,
                    Accept: 'application/json'
                },
                responseType: 'arraybuffer',
            }
        );

        const contentType = response.headers['content-type'] || 'image/png';
        const imageBase64 = Buffer.from(response.data, 'binary').toString('base64');
        const imageUrl = `data:${contentType};base64,${imageBase64}`;

        res.json({ image: imageUrl });
    } catch (err) {
        console.error('❌ Image Generation Error:', err.response?.data || err.message);
        res.status(500).json({ error: 'Failed to generate image' });
    }
});

// Serve static files from public
app.use(express.static(path.join(__dirname, 'public')));

// Serve home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'logo.html'));
});

// // Register route
// app.post('/register', async (req, res) => {
//     const { username, password } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
//     db.query(query, [username, hashedPassword], (err, result) => {
//         if (err) return res.status(500).json({ error: err.message });
//         res.status(200).json({ message: 'User registered successfully!' });
//     });
// });

// // Login route
// app.post('/login', (req, res) => {
//     const { username, password } = req.body;

//     const query = 'SELECT * FROM users WHERE username = ?';
//     db.query(query, [username], async (err, results) => {
//         if (err) return res.status(500).json({ error: err.message });
//         if (results.length === 0) return res.status(400).json({ message: 'User not found!' });

//         const user = results[0];
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) return res.status(400).json({ message: 'Incorrect password!' });

//         res.status(200).json({ message: 'Login successful!' });
//     });
// });

// // Start server
// app.listen(port, () => {
//     console.log(`🚀 Server running at: http://localhost:${port}`);
// });

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

