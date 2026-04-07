const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.js')) {
            const newPath = fullPath.slice(0, -3) + '.jsx';
            fs.renameSync(fullPath, newPath);
            console.log(`Renamed: ${file} -> ${path.basename(newPath)}`);
        }
    });
}

walk(srcDir);
console.log('Done renaming files.');
