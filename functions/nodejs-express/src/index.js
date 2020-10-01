const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb' }));

app.use(express.static('public'));
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/:route', (req, res, next) => {
  try {
    const handler = require(`./handlers/${req.params.route}`);
    if (!handler) {
      return res.status(404).json({
        message: `not found`
      });
    }
    return handler(req, res, next);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: `unexpected error occured`
    });
  }
});

app.listen(PORT);
