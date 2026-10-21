/* eslint-disable @typescript-eslint/no-require-imports -- Next.js loads this PostCSS plugin through CommonJS. */
const fs = require('node:fs');
const path = require('node:path');
const postcss = require('postcss');
// Keep the supplied tokens.css intact; fonts.css supplies local faces at runtime.
module.exports = () => ({
  postcssPlugin: 'officequest-local-fonts',
  Once(root) {
    function inline(container, from) {
      for (const node of [...container.nodes]) {
        if (node.type !== 'atrule' || node.name !== 'import') continue;
        const match = node.params.match(/^['"](\.[^'"]+\.css)['"]$/);
        if (!match) continue;
        const file = path.resolve(path.dirname(from), match[1]);
        const imported = postcss.parse(fs.readFileSync(file, 'utf8'), { from: file });
        inline(imported, file);
        node.replaceWith(imported.nodes);
      }
    }
    inline(root, root.source.input.file);
    root.walkAtRules('font-face', rule => {
      if (rule.nodes.some(node => node.prop === 'src' && node.value.includes('fastly.jsdelivr.net') && node.value.includes('Paperlogy'))) rule.remove();
    });
  },
});
module.exports.postcss = true;
