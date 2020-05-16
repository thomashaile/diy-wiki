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
    const filePath = path.join('data', `${req.params.slug}.md`);
    try {
        let text = await readFile(filePath, 'utf-8');
        res.json({ status: 'ok', body: text });
    } catch {
        res.json({ status: 'error', message: 'Page does not exist.' });
    }
});

// Add a New Page using POST
app.post('/api/page/:slug', async(req, res) => {
    const filePath = path.join('data', `${req.params.slug}.md`);
    try {
        let text = req.body.body;
        await writeFile(filePath, text);
        res.json({ status: 'ok' });
    } catch {
        res.json({ status: 'error', message: 'Could not write page.' });
    }
});

//Get all Pages - working
app.get('/api/pages/all', async(req, res) => {
    let dir = await readDir('data');
    dir = dir.map(names => {
        let arrPageNames = names.split('.');
        return arrPageNames[0];
    });
    res.json({ status: 'ok', pages: dir });
});

//Get all Tags - working
app.get('/api/tags/all', async(req, res) => {
    const names = await readDir(DATA_DIR);
    console.log(names);
    res.json({ status: 'ok', tags: names });
});

// Get single tagGET: '/api/tags/:tag'
app.get('/api/tags/:tag', async(req, res) => {
    let tag = req.params.tag;
    let dir = await readDir('data');
    dir = dir.map(i => {
        let filePath = path.join('data', i);
        return filePath;
    });
    let pages = [];
    for (let i = 0; i < dir.length; i++) {
        let text = await readFile(dir[i], 'utf-8');
        if (text.includes(tag)) {
            let page = path.basename(dir[i], '.md');
            pages.push(page);
        }
    }
    res.json({ status: 'ok', tag: 'tagName', pages });
});

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