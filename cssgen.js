const sass = require('node-sass');
const fs = require('fs');

sass.render({
  file: 'rufus.sass',
}, (error, result) => {
  if (!error) {
    fs.writeFile('public/css/bulma.css', result.css, (err) => {
      if (err) {
        console.log(err);
      }
    });
  }
});
