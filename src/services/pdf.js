const fs = require("fs");
const { PDFDocument } = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");
const _ = require("lodash");
const Jimp = require("jimp");
const fetch = require("node-fetch");
const {
  resetTemp,
  jsonKeysToString,
  cvtThaiToArabic,
  cvtCheckBoxValue,
} = require("../utils/converter");

const {
  removeEditorWaterMask,
  readDocumentMetadata,
  updateMetaData,
  embedImageAsync,
  addWaterMask,
  addWaterLogoAsync,
} = require("../utils/pdf");
const { compressImageAsync } = require("../utils/image");

const fillForm = async (parameters, options) => {
  const fontBytes = fs.readFileSync(
    `./src/assets/fonts/Sarabun/Sarabun-${options?.bold ? "Medium" : "Regular"
    }.ttf`
  );

  const { fileName, fileDateVersion, title } = parameters;
  resetTemp();
  const variables = jsonKeysToString(parameters?.variables);

  return new Promise((resolve, reject) => {
    const fileRefer = fileDateVersion + "_" + fileName;
    const path = "./src/master/pdf/" + fileRefer + ".pdf";
    fs.readFile(path, async (err, fileBytes) => {
      if (err) throw err;

      try {
        const pdfDoc = await PDFDocument.load(fileBytes);
        pdfDoc.registerFontkit(fontkit);
        updateMetaData(pdfDoc, { fileRefer, title });
        removeEditorWaterMask(pdfDoc);

        const thaiFont = await pdfDoc.embedFont(fontBytes, { subset: true });

        const form = pdfDoc.getForm();

        for (const key in variables) {
          if (key?.includes("CHECKBOX")) {
            let checkboxKey = `${key}:${cvtCheckBoxValue(
              variables?.[key]
            )?.toUpperCase()}`;

            const _checkboxKey = cvtThaiToArabic(checkboxKey).join("");

            const checkBox = form.getTextField(_checkboxKey);
            if (checkBox) {
              checkBox.setText("/");
              checkBox.enableReadOnly();
            }
          } else if (key?.includes("IMAGE")) {
            const compressed = await compressImageAsync({
              bufferOrUrl: variables?.[key],
              quality: 10,
            });

            const imageSrc = await embedImageAsync({
              ref: pdfDoc,
              mimeType: compressed?.mimeType,
              imageBytes: compressed?.source,
            });

            const faceBox = form.getTextField(key);
            faceBox.setImage(imageSrc);
          } else if (
            _.includes(key, "SIGNATURE") ||
            _.includes(key, "COMPANY_LOGO")
          ) {
            const compressed = await compressImageAsync({
              bufferOrUrl: variables?.[key],
              quality: 0.5,
            });

            const imageSrc = await embedImageAsync({
              ref: pdfDoc,
              mimeType: compressed?.mimeType,
              imageBytes: compressed?.source,
            });

            const signatureBox = form.getTextField(key);
            signatureBox.setImage(imageSrc);
          } else {
            const _key = cvtThaiToArabic(key).join("");
            const textField = form.getTextField(_key);

            if (textField) {
              textField.setText(variables?.[_key] || "-");
              textField.updateAppearances(thaiFont);
              textField.enableReadOnly();
            }
          }
        }
        form.flatten();

        if (options?.options?.waterMask?.enabled) {
          addWaterMask(pdfDoc, {
            font: thaiFont,
            text: options?.options?.waterMask?.text,
          });
        }

        if (options?.options?.security?.enabled) {
          // addPassword(pdfDoc, { password: "1234" });
        }

        if (options?.options?.waterMaskLogo?.enabled) {
          addWaterLogoAsync(pdfDoc);
        }

        pdfDoc.save({ options }).then(function (pdfBytes) {
          readDocumentMetadata(pdfDoc);
          resolve(pdfBytes);
        });
      } catch (error) {
        reject(`🔴 ERROR: service > fillForm() > ${error.message}`);
      }
    });
  });
};

const fillFormEmpty = async (fileBytes, options) => {
  return new Promise(async (resolve, reject) => {
    try {
      const pdfDoc = await PDFDocument.load(fileBytes);

      removeEditorWaterMask(pdfDoc);

      pdfDoc.save({ options }).then(function (pdfBytes) {
        readDocumentMetadata(pdfDoc);
        resolve(pdfBytes);
      });
    } catch (error) {
      reject(`🔴 ERROR: service > fillFormBlank() > ${error.message}`);
    }
  });
};

const createPdfWithImage = async ({ bufferOrUrl, quality = 80 }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const pdfDoc = await PDFDocument.create({ size: "A4" });
      const page = pdfDoc.addPage();
      const compressed = await compressImageAsync({
        bufferOrUrl,
        quality,
      });

      const imageSrc = await embedImageAsync({
        ref: pdfDoc,
        mimeType: compressed?.mimeType,
        imageBytes: compressed?.source,
      });

      const imgDims = imageSrc.scale(1);
      const maxWidth = page.getWidth() - 100;
      const maxHeight = page.getHeight() - 100;

      if (imgDims.width > maxWidth) {
        const scaleFactor = Math.min(
          maxWidth / imgDims.width,
          maxHeight / imgDims.height
        );

        const xPos = page.getWidth() / 2 - (imgDims.width * scaleFactor) / 2;
        const yPos = page.getHeight() / 2 - (imgDims.height * scaleFactor) / 2;

        page.drawImage(imageSrc, {
          x: xPos,
          y: yPos,
          width: imgDims.width * scaleFactor,
          height: imgDims.height * scaleFactor,
        });
      } else {
        const imgDims = imageSrc.scale(1);

        const xPos = page.getWidth() / 2 - imgDims.width / 2;
        const yPos = page.getHeight() / 2 - imgDims.height / 2;

        page.drawImage(imageSrc, {
          x: xPos,
          y: yPos,
          width: imgDims.width,
          height: imgDims.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      resolve(pdfBytes);
    } catch (error) {
      reject(`🔴 ERROR: service > createPdfWithImage() > ${error.message}`);
    }
  });
};
const createPdfWithImages = async ({ files, quality = 80 }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const pdfDoc = await PDFDocument.create({ size: "A4" });

      for (const imagePath of files) {
        const page = pdfDoc.addPage();
        let bufferOrUrl = imagePath;

        if (!_.startsWith(imagePath, "http")) {
          const _base64 = imagePath.split(",");
          bufferOrUrl = Buffer.from(_base64?.[_base64.length - 1], "base64");
        } else {
          bufferOrUrl = await Jimp.read(imagePath);
        }

        const compressed = await compressImageAsync({
          bufferOrUrl,
          quality,
        });

        const imageSrc = await embedImageAsync({
          ref: pdfDoc,
          mimeType: compressed?.mimeType,
          imageBytes: compressed?.source,
        });

        const imgDims = imageSrc.scale(1);

        const maxWidth = page.getWidth() - 100;
        const maxHeight = page.getHeight() - 100;

        if (imgDims.width > maxWidth) {
          const scaleFactor = Math.min(
            maxWidth / imgDims.width,
            maxHeight / imgDims.height
          );

          const xPos = page.getWidth() / 2 - (imgDims.width * scaleFactor) / 2;
          const yPos =
            page.getHeight() / 2 - (imgDims.height * scaleFactor) / 2;

          page.drawImage(imageSrc, {
            x: xPos,
            y: yPos,
            width: imgDims.width * scaleFactor,
            height: imgDims.height * scaleFactor,
          });
        } else {
          const imgDims = imageSrc.scale(1);

          const xPos = page.getWidth() / 2 - imgDims.width / 2;
          const yPos = page.getHeight() / 2 - imgDims.height / 2;

          page.drawImage(imageSrc, {
            x: xPos,
            y: yPos,
            width: imgDims.width,
            height: imgDims.height,
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      resolve(pdfBytes);
    } catch (error) {
      reject(`🔴 ERROR: service > createPdfWithImages() > ${error.message}`);
    }
  });
};

const mergePdf = ({ files }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const pdfDoc = await PDFDocument.create({ size: "A4" });

      for (const bufferOrUrl of files) {
        let arrayBuffer;
        if (!_.startsWith(bufferOrUrl, "http")) {
          const _base64 = bufferOrUrl.split(",");
          arrayBuffer = Buffer.from(_base64?.[_base64.length - 1], "base64");
        } else {
          arrayBuffer = await fetch(bufferOrUrl).then((res) =>
            res.arrayBuffer()
          );
        }

        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = await pdfDoc.copyPages(pdf, pdf.getPageIndices());

        pages.forEach((page) => pdfDoc.addPage(page));
      }

      const mergedPdfBytes = await pdfDoc.save();
      resolve(mergedPdfBytes);
    } catch (error) {
      reject(`🔴 ERROR: service > mergePdf() > ${error.message}`);
    }
  });
};

module.exports = {
  fillForm,
  fillFormEmpty,
  createPdfWithImage,
  createPdfWithImages,
  mergePdf,
};
