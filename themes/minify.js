import path from "path"
import fs from "fs"
import postcss from "postcss"
import cssnano from "cssnano"

function minify(cssPath)  {
    const basename = path.basename(cssPath);
    const newBasename = basename.split(".")[0] + ".min.css";
    const css = fs.readFileSync(cssPath, 'utf-8');
    postcss([cssnano])
    .process(css, { from: cssPath })
    .then(({ css }) => fs.writeFileSync(path.join(cssPath, '../', newBasename), css))
}

fs.readdir('./themes', (_, files) => {
    if(files) {
        files = files.filter(name => name.endsWith(".src.css"))
        for(const file of files) {
            minify(path.join('./themes', file))
        }
    }
})