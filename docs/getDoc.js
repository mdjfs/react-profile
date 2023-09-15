const path = require("path");
const fs = require("fs");
const postcss = require("postcss");
const cssnano = require("cssnano");

function minify(cssPath) {
  const basename = path.basename(cssPath);
  const newBasename = basename.split(".")[0] + ".min.css";
  const css = fs.readFileSync(cssPath, "utf-8");
  postcss([cssnano])
    .process(css, { from: cssPath })
    .then(({ css }) => fs.writeFileSync(path.join(cssPath, "../", newBasename), css));
}

fs.readdir("./docs", (_, files) => {
  if (files) {
    files = files.filter((name) => name.endsWith(".md") || name !== "README.md");
    const obj = {};
    let readme = fs.readFileSync(path.join("./docs", "README.MD"), "utf-8");
    for (const file of files) {
      const name = file.split(".")[0];
      const content = fs.readFileSync(path.join("./docs", file), "utf-8");
      obj[name] = content;
    }
    for (const [key, content] of Object.entries(obj)) {
      readme = readme.replace(`{{${key}}}`, content);
    }
    fs.writeFileSync("./README.MD", readme, "utf-8");
  }
});
