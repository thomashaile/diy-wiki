const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const util = require('util');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Uncomment this out once you've made your first route.
app.use(express.static(path.join(__dirname, 'client', 'build')));

// some helper functions you can use
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const readDir = util.promisify(fs.readdir);

// some more helper functions
const DATA_DIR = 'data';
const TAG_RE = /#\w+/g;

function slugToPath(slug) {
    const filename = `${slug}.md`;
    return path.join(DATA_DIR, filename);
}

function jsonOK(res, data) {
    res.json({ status: 'ok', ...data });
}

function jsonError(res, message) {
    res.json({ status: 'error', message });
}

app.get('/', (req, res) => {
    res.json({ wow: 'it works!' });
});

// Get an Existing Page GET: '/api/page/:slug'
app.get('/api/page/:slug', async(req, res) => {
    const filename = `${req.params.slug}`;
    const fullFilename = path.join(DATA_DIR, filename);
    try {
        const text = await readFile(fullFilename);
        res.json({ status: 'ok', body: text });
    } catch {
        res.json({ status: 'error', message: 'Page does not exist.' });
    }
});

// Get a New Page POST: '/api/page/:slug'
app.post('/api/page/:slug', async(req, res) => {
    const filePath = path.join('data', `${req.params.slug}.md`);
    const text = req.body.body;
    try {
        await writeFile(filePath, text);
        res.json({ status: 'ok' });
    } catch (e) {
        res.json({ status: 'error', message: 'could not write page. please try again later.' });
    }
});

//Get all Pages
app.get('/api/page/all', async(req, res) => {
    const names = await readDir(DATA_DIR);
    console.log(names);
    jsonOK(res, {});
});

//Get all Tags
app.get('/api/tags/all', async(req, res) => {
    const names = await readDir(DATA_DIR);
    console.log(names);
    jsonOK(res, {});
});

// Get Page Names by Tag GET: '/api/tags/:tag'
app.get('/api/tags/:tag', async(req, res) => {
    const tagname = `${req.params.tag}`;
    const fullFilename = path.join(DATA_DIR, tagname);
    try {
        const text = await readFile(fullFilename);
        res.json({ status: 'ok', tag: text });
    } catch {
        res.json({ status: 'error', message: 'Tag not found.' });
    }
});
//wiki client
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});
//server env
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Wiki app is running at http://localhost:${port}`));

// If you want to see the wiki client, run npm install && npm buildin the client folder,
// then comment the line above and uncomment out the lines below and comment the line above.
//app.get('*', (req, res) => {
//res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
//});

// GET: '/api/page/:slug'
// success response: {status: 'ok', body: '<file contents>'}
// failure response: {status: 'error', message: 'Page does not exist.'}

// POST: '/api/page/:slug'
// body: {body: '<file text content>'}
// success response: {status: 'ok'}
// failure response: {status: 'error', message: 'Could not write page.'}

// GET: '/api/pages/all'
// success response: {status:'ok', pages: ['fileName', 'otherFileName']}
//  file names do not have .md, just the name!
// failure response: no failure response

// GET: '/api/tags/all'
// success response: {status:'ok', tags: ['tagName', 'otherTagName']}
//  tags are any word in all documents with a # in front of it
// failure response: no failure response

// GET: '/api/tags/:tag'
// success response: {status:'ok', tag: 'tagName', pages: ['tagName', 'otherTagName']}
//  file names do not have .md, just the name!
// failure response: no failure responsea