const { Router } = require("express");
const r = Router();
const _ = require("lodash");

r.route("/").post(async (req, res) => {
  try {
    const requireBodies = ["bufferOrUrl"];

    requireBodies.forEach((field) => {
      if (_.isEmpty(req.body[field])) throw "Parameter is invalid.";
    });

    const { quality, bufferOrUrl, base64 } = req.body;

    const compressed = await req.ctx.helpers.image.compressImageAsync({
      bufferOrUrl: bufferOrUrl,
      quality: quality || 10,
      base64,
    });

    if (base64) {
      req.responseSuccess(res, {
        payload: { compressed },
      });
    } else {
      res.setHeader("Content-Type", compressed?._mimeType);
      res.send(compressed?.source);
    }
  } catch (error) {
    req.responseError(res, error);
  }
});

module.exports = r;
