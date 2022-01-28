#!/usr/bin/env node
const express = require('express')
const app = express()
const port = 8080;
var fs = require('fs/promises');
const [swaggerArgs] = process.argv.filter(obj => obj.includes('swagger-url'));
const [swaggerFile] = process.argv.filter(obj => obj.includes('swagger-file'));
app.use('/', express.static(`${ __dirname}/dist`));
async function terminate() {
  try {
    const data = await fs.readFile(`${ __dirname}/dist/index.html`, 'utf8');
      let swaggerUrl;
    if (swaggerArgs) {
      // External URL
      swaggerUrl = swaggerArgs.split('=')[1]
    } else {
      swaggerUrl = `http://localhost:8080/${swaggerFile.split('=')[1]}`;
    }
    var result = data.replace(`url:"${swaggerUrl}"`, 'url:');
    await fs.writeFile(`${ __dirname}/dist/index.html`, result, 'utf8');
    process.exit(1);
  } catch(err) {
    process.exit(1);
  }
}

async function replaceUrl() {
    const data = await fs.readFile(`${ __dirname}/dist/index.html`, 'utf8');
    let swaggerUrl;
      if (swaggerArgs) {
        swaggerUrl = swaggerArgs.split('=')[1];
      } else {
        swaggerUrl = `http://localhost:8080/${swaggerFile.split('=')[1]}`;
      }
      var result = data.replace(/url:/g, `url:"${swaggerUrl}"`);
      await fs.writeFile(`${ __dirname}/dist/index.html`, result, 'utf8')

}

app.get('/swagger.json', (req, res) => {
  const data = require('../../swagger.json')
  res.json(data)
});

process.on('SIGTERM', async() => {
  try{
    await terminate()
} catch(err) {
  process.exit(1)
}
});

process.on('SIGINT', async() => {
  try {
    await terminate()
}catch(err) {
    process.exit(1)
  }
});

app.listen(port, async() => {
  if (swaggerArgs || swaggerFile) {
    await replaceUrl();
    console.log(`Example app listening on port ${port}`)
  } else {
    console.log('Swagger Url or fileName Needs To Pass');
    process.exit(1);
  }
})
