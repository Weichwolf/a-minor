# Locally hosted PDF export

- [pdfmake](https://github.com/bpampuch/pdfmake) 0.3.11, MIT, including its bundled SVG-to-PDFKit renderer. License texts are adjacent to the JavaScript files.
- [DejaVu Sans](https://dejavu-fonts.github.io/) 2.37, distributed through the pinned `dejavu-fonts-ttf` 2.37.3 package. The regular and bold fonts are included unchanged; see `DejaVu-LICENSE` for the Bitstream Vera and additional font notices. This font covers the arrows, accidentals and pulse symbols in the notation.

`npm ci && npm run vendor:pdf` recreates the files. The pdfmake source-map reference is removed. `vfs_fonts.js` registers the two font files and their normal/bold mappings. These assets load on the first PDF download and are served locally; no runtime CDN requests. The score remains vector graphics and fits the three ABC sections on one A4 page. A performance note specifies the ABAC playing order.
