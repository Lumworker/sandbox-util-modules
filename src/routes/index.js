const express = require("express");
const fs = require("fs");
const path = require("path");

const baseDir = __dirname;
const fileName = path.basename(__filename);
const filesArray = fs.readdirSync(baseDir).filter((x) => x !== fileName);

const router = express.Router();

filesArray.forEach((file) => {
  const mod = require(path.join(baseDir, "/", file));
  const pathRoute = file.split(".")[0];

  router.use(`/${pathRoute}`, mod);
});

module.exports = router;
