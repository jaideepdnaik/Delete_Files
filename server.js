const express = require('express');
const path = require('path');
const fs = require('fs').promises; // Using promises from fs for async operations
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, 'frontend')));

// Route to serve files and directories
app.use((req, res, next) => {
    let dirPath;

    if (req.path.startsWith('/backend')) {
        dirPath = path.join(__dirname, 'backend', req.path.replace('/backend', ''));
    } else if (req.path.startsWith('/frontend')) {
        dirPath = path.join(__dirname, 'frontend', req.path.replace('/frontend', ''));
    } else {
        dirPath = path.join(__dirname, req.path);
    }

    fs.stat(dirPath)
        .then(stats => {
            if (stats.isDirectory()) {
                return fs.readdir(dirPath)
                    .then(files => {
                        const fileLinks = files.map(file => {
                            const filePath = path.join(req.path, file);
                            return `<li>${file} <button onclick="deleteFile('${filePath}')">Delete</button></li>`;
                        }).join('');
                        res.send(`<ul>${fileLinks}</ul>
                            <script>
                                function deleteFile(filePath) {
                                    fetch('/delete', {
                                        method: 'DELETE',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({ path: filePath })
                                    })
                                    .then(response => {
                                        if (response.ok) {
                                            window.location.reload();
                                        } else {
                                            response.text().then(text => {
                                                alert('Failed to delete file: ' + text);
                                            });
                                        }
                                    });
                                }
                            </script>`);
                    });
            } else {
                return res.sendFile(dirPath);
            }
        })
        .catch(err => {
            console.error('Error accessing file:', err);
            return res.status(500).send('Server Error');
        });
});

// Route to handle file deletion
app.delete('/delete', (req, res) => {
    const filePath = path.join(__dirname, req.body.path.replace(/^\//, ''));

    fs.unlink(filePath)
        .then(() => {
            console.log('File deleted:', filePath);
            res.status(200).send('File Deleted');
        })
        .catch(err => {
            console.error('Failed to delete file:', filePath, err);
            res.status(500).send('Failed to delete file');
        });
});

// Fallback to index.html for single-page applications
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});