const express = require('express');
const fs = require('fs');
const path = require('path');
const xpath = require('xpath');
const { DOMParser } = require('xmldom');

const app = express();
app.use(express.json());

// Register static folders (we keep a list so we can print them later)
const staticMounts = [];
function mountStatic(mountPoint, dir) {
    if (mountPoint === '/') {
        app.use(express.static(dir));
        staticMounts.push({ mountPoint: '/', dir });
    } else {
        app.use(mountPoint, express.static(dir));
        staticMounts.push({ mountPoint, dir });
    }
}

const frontendDir = path.join(__dirname, '..', 'frontend');
const dataDir = path.join(__dirname, '..', 'data');
const xsltDir = path.join(__dirname, '..', 'xslt');

mountStatic('/', frontendDir);
mountStatic('/data', dataDir);
mountStatic('/xslt', xsltDir);

// Also add an explicit static middleware for `frontend` (requested)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ---------------------
// SEARCH ENDPOINT
// ---------------------
app.get('/search', (req, res) => {
    try {
        const { category, min, max, stock } = req.query;

        const xmlPath = path.join(__dirname, '..', 'data', 'products.xml');
        const xml = fs.readFileSync(xmlPath, 'utf8');
        const doc = new DOMParser().parseFromString(xml);

        const nodes = xpath.select('//product', doc) || [];

        const products = nodes.map(n => ({
            id: n.getAttribute('id'),
            name: xpath.select1('string(name)', n),
            category: xpath.select1('string(category)', n),
            price: xpath.select1('string(price)', n),
            stock: xpath.select1('string(stock)', n),
            rating: xpath.select1('string(rating)', n),
        }));

        const numeric = v => parseFloat(v);
        const minN = min ? numeric(min) : null;
        const maxN = max ? numeric(max) : null;

        const filtered = products.filter(p =>
            (!category || p.category === category) &&
            (!stock || p.stock === stock) &&
            (minN === null || numeric(p.price) >= minN) &&
            (maxN === null || numeric(p.price) <= maxN)
        );

        res.json(filtered);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

function listUrls(port) {
    const list = [];

    // Static mounts
    staticMounts.forEach(s => {
        const mount = s.mountPoint === '/' ? '/' : (s.mountPoint.endsWith('/') ? s.mountPoint : s.mountPoint + '/');
        list.push({ type: 'static', url: `http://localhost:${port}${mount}`, dir: s.dir });
    });

    // Also enumerate some static files under each mount (common web files)
    const fileExtAllow = new Set(['.html', '.xml', '.xsl', '.css', '.js']);
    function walkFiles(dir, relative = '') {
        const results = [];
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const e of entries) {
                const rel = relative ? (relative + '/' + e.name) : e.name;
                const full = path.join(dir, e.name);
                if (e.isDirectory()) {
                    results.push(...walkFiles(full, rel));
                } else if (e.isFile()) {
                    const ext = path.extname(e.name).toLowerCase();
                    if (fileExtAllow.has(ext)) results.push(rel.replace(/\\/g, '/'));
                }
            }
        } catch (err) {
            // ignore permission/read errors
        }
        return results;
    }

    staticMounts.forEach(s => {
        const mountPrefix = s.mountPoint === '/' ? '' : s.mountPoint;
        const files = walkFiles(s.dir);
        files.forEach(f => {
            const url = `http://localhost:${port}${mountPrefix}/${f}`.replace(/\\/g, '/');
            list.push({ type: 'file', url, file: path.join(s.dir, f) });
        });
    });

    // Express routes
    if (app._router && app._router.stack) {
        app._router.stack.forEach(layer => {
            if (layer.route && layer.route.path) {
                const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase()).join(',');
                const pathStr = layer.route.path;
                list.push({ type: 'route', methods, url: `http://localhost:${port}${pathStr}` });
            }
        });
    }

    return list;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    const urls = listUrls(PORT);
    console.log('Available URLs:');
    urls.forEach(u => {
        if (u.type === 'static') console.log(`  [static] ${u.url} -> ${u.dir}`);
        else if (u.type === 'route') console.log(`  [route]  ${u.methods} ${u.url}`);
        else if (u.type === 'file') console.log(`  [file]   ${u.url} -> ${u.file}`);
    });
});
