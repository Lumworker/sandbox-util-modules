const { Router } = require("express");
const r = Router();
const _ = require("lodash");
const Jimp = require("jimp");

r.route("/with-single-image").post(async (req, res) => {
  try {
    const { base64, file, quality } = req.body;
    let bufferOrUrl = file;
    if (!_.startsWith(file, "http")) {
      const _base64 = file.split(",");
      bufferOrUrl = Buffer.from(_base64?.[_base64.length - 1], "base64");
    } else {
      bufferOrUrl = await Jimp.read(file);
    }

    const pdf = await req.ctx.services.pdf.createPdfWithImage({
      bufferOrUrl,
      quality,
    });

    if (base64) {
      req.responseSuccess(res, {
        payload: { base64: Buffer.from(pdf).toString("base64") },
      });
    } else {
      res.setHeader("Content-Type", "application/pdf");
      res.send(Buffer.from(pdf));
    }
  } catch (error) {
    req.responseError(res, error);
  }
});

r.route("/with-multiple-image").post(async (req, res) => {
  try {
    const { base64, files, quality } = req.body;

    const pdf = await req.ctx.services.pdf.createPdfWithImages({
      files,
      quality,
    });

    if (base64) {
      req.responseSuccess(res, {
        payload: { base64: Buffer.from(pdf).toString("base64") },
      });
    } else {
      res.setHeader("Content-Type", "application/pdf");
      res.send(Buffer.from(pdf));
    }
  } catch (error) {
    req.responseError(res, error);
  }
});

module.exports = r;
