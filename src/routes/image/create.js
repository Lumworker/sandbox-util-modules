const { Router } = require("express");
const r = Router();
const _ = require("lodash");
const Jimp = require("jimp");

r.route("/resize").post(async (req, res) => {
  try {
    const {
      bufferOrUrl,
      width,
      height,
      returnBase64 = false,
      quality = 0.5,
    } = req.body;

    let _bufferOrUrl = bufferOrUrl;
    if (!_.startsWith(bufferOrUrl, "http")) {
      const _base64 = bufferOrUrl.split(",");
      _bufferOrUrl = Buffer.from(_base64?.[_base64.length - 1], "base64");
    } else {
      _bufferOrUrl = await Jimp.read(bufferOrUrl);
    }

    const image = await Jimp.read(_bufferOrUrl);

    image.resize(width, height).quality(quality);

    const buffer = await image.getBufferAsync(Jimp.MIME_PNG);

    if (returnBase64) {
      req.responseSuccess(res, {
        payload: { base64: Buffer.from(buffer).toString("base64") },
      });
    } else {
      res.setHeader("Content-Type", "image/png");
      res.send(Buffer.from(buffer));
    }
  } catch (error) {
    req.responseError(res, error);
  }
});

module.exports = r;
