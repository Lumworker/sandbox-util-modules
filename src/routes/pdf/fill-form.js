const { Router } = require("express");
const r = Router();
const fs = require("fs");

r.route("/").post(async (req, res) => {
  try {
    await req.ctx.services.pdf
      .fillForm(req?.body, {
        bold: true,
        updateFieldAppearances: false,
        useObjectStreams: false,
        options: req?.body?.options,
      })
      .then((bufferData) => {
        res.setHeader("Content-Type", "application/pdf");
        res.send(Buffer.from(bufferData));
      })
      .catch((err) => {
        throw err;
      });
  } catch (error) {
    console.log("error :", error);
    req.responseError(res, error);
  }
});

r.route("/view").get(async (req, res) => {
  try {
    const { form, versionDate } = req.query;
    const formId = form?.toUpperCase();

    const jsonData = fs.readFileSync(
      `./src/master/data/${versionDate}_${formId}.json`
    );
    const data = JSON.parse(jsonData);

    await req.ctx.services.pdf
      .fillForm(data, {
        bold: true,
        updateFieldAppearances: false,
        useObjectStreams: false,
        options: data?.options,
      })
      .then((bufferData) => {
        res.setHeader("Content-Type", "application/pdf");
        res.send(Buffer.from(bufferData));
      })
      .catch((err) => {
        throw err;
      });
  } catch (error) {
    console.log("🚀 ~ file: fill-form.js ~ line 48 ~ r.route ~ error", error);
    req.responseError(res, error);
  }
});

module.exports = r;
