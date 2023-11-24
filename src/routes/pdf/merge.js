const { Router } = require("express");
const r = Router();

r.route("/").post(async (req, res) => {
  try {
    const { base64, files } = req.body;

    await req.ctx.services.pdf
      .mergePdf({ files })
      .then((pdf) => {
        if (base64) {
          req.responseSuccess(res, {
            payload: { base64: Buffer.from(pdf).toString("base64") },
          });
        } else {
          res.setHeader("Content-Type", "application/pdf");
          res.send(Buffer.from(pdf));
        }
      })
      .catch((err) => {
        throw err;
      });
  } catch (error) {
    req.responseError(res, error);
  }
});

module.exports = r;
