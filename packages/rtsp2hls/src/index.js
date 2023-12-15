const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const YAML = require('yaml');

// yml 配置文件路径
const MEDIAMTXYML_URL = './mediamtx/mediamtx.yml';

// 转换最大路数
const CONVERSION_CHANNELS_MAX_NUM = 5;

/**
 * 写入 YML 配置文件
 * @param {string} path 输出路径
 * @param {string} url RTSP 视频流地址
 */
const writeConfigFile = (path, url) => {
  const doc = YAML.parse(fs.readFileSync(MEDIAMTXYML_URL, 'utf8'));
  let pathKeys = Object.keys(doc.paths);
  while (pathKeys.length > CONVERSION_CHANNELS_MAX_NUM) {
    delete doc.paths[pathKeys[1]];
    pathKeys = Object.keys(doc.paths);
  }
  doc.paths[path] = { source: url };
  fs.writeFileSync(MEDIAMTXYML_URL, YAML.stringify(doc));
};

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.all('*', function (req, res, next) {
  res.setHeader('access-control-allow-origin', '*');
  res.setHeader('access-control-allow-credentials', true);
  res.setHeader('access-control-allow-headers', 'content-type');
  res.setHeader('access-control-allow-methods', '*');
  res.setHeader('access-control-request-headers', '*');
  res.setHeader('access-control-request-methods', '*');
  next();
});

app.post('/rtsp2hls', function (req, res, next) {
  try {
    const { url, targetPath } = req.body;
    const { protocol } = new URL(url);
    if (protocol === 'rtsp:') {
      writeConfigFile(targetPath, url);
      return res.send({ msg: 'ok' });
    } else {
      return res.sendStatus(400);
    }
  } catch (err) {
    return next(err);
  }
});

app.listen(34265, () => {
  console.log('rtsp2hls server listening on port 34265');
});