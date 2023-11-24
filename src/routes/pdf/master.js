const { Router } = require("express");
const r = Router();
const fs = require("fs");

r.route("/data").get(async (req, res) => {
  try {
    const { form, versionDate } = req.query;
    const formId = form?.toUpperCase();

    const jsonData = fs.readFileSync(
      `./src/master/data/${versionDate}_${formId}.json`
    );
    const data = JSON.parse(jsonData);

    req.responseSuccess(res, {
      payload: { formId, versionDate, data },
    });
  } catch (error) {
    req.responseError(res, error);
  }
});

r.route("/variables").get(async (req, res) => {
  try {
    const { form, versionDate } = req.query;
    const formId = form?.toUpperCase();

    const jsonData = fs.readFileSync(
      `./src/master/data/${versionDate}_${formId}.json`
    );
    const data = JSON.parse(jsonData);

    const variables = req.ctx.utils.converters.jsonKeysToString(
      data?.variables
    );

    const _variables = {};

    Object.keys(variables).map((k) => {
      _variables[k] = "";
    });

    req.responseSuccess(res, {
      payload: { formId, versionDate, variables: _variables },
    });
  } catch (error) {
    req.responseError(res, error);
  }
});

r.route("/pdf").get(async (req, res) => {
  try {
    const { form, versionDate } = req.query;
    const formId = form?.toUpperCase();
    const buffer = fs.readFileSync(
      `./src/master/pdf/${versionDate}_${formId}.pdf`
    );
    await req.ctx.services.pdf
      .fillFormEmpty(buffer, {
        updateFieldAppearances: false,
        useObjectStreams: false,
      })
      .then((bufferData) => {
        res.setHeader("Content-Type", "application/pdf");
        res.send(Buffer.from(bufferData));
      })
      .catch((err) => {
        throw err;
      });
  } catch (error) {
    req.responseError(res, error);
  }
});

module.exports = r;
