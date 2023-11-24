const { rgb, degrees } = require("pdf-lib");
const fs = require("fs");
const removeEditorWaterMask = (ref) => {
  const pageCount = ref.getPageCount();
  for (let i = 0; i < pageCount; i++) {
    const page = ref.getPage(i);
    const size = page.getSize();

    const y = size.height - 25;
    const width = size.width / 3;
    const height = 25;

    page.drawRectangle({
      x: size.width - width,
      y,
      width,
      height,
      color: rgb(1, 1, 1),
    });
  }
  return;
};

const addWaterMask = (ref, { font, text }) => {
  const pageCount = ref.getPageCount();
  for (let i = 0; i < pageCount; i++) {
    const page = ref.getPage(i);
    const { width, height } = page.getSize();

    page.drawText(text || "ตัวอย่างเอกสาร", {
      x: width / 5.2,
      y: height / 1.45,
      size: 76,
      color: rgb(0.95, 0.1, 0.1),
      font,
      rotate: degrees(-45),
      opacity: 0.4,
    });
  }
  return;
};

const addWaterLogoAsync = async (ref) => {
  const pageCount = ref.getPageCount();
  const imageBytes = fs.readFileSync("./src/assets/images/logo4x.png");

  const image = await ref.embedPng(imageBytes);

  for (let i = 0; i < pageCount; i++) {
    const page = ref.getPage(i);
    const { width, height } = page.getSize();

    const imageWidth = image.width;
    const imageHeight = image.height;

    const x = (width - imageWidth) / 2;
    const y = (height - imageHeight) / 2;

    page.drawImage(image, {
      x,
      y,
      width: imageWidth,
      height: imageHeight,
      opacity: 0.1,
    });
  }
  return;
};

const addPassword = (ref, { password }) => {
  ref.setEncryption(password);
};

const readDocumentMetadata = async (ref) => {
  console.log("\n########################################################\n");
  console.log("Title:", ref.getTitle());
  console.log("Author:", ref.getAuthor());
  console.log("Subject:", ref.getSubject());
  console.log("Creator:", ref.getCreator());
  console.log("Keywords:", ref.getKeywords());
  console.log("Producer:", ref.getProducer());
  console.log("Creation Date:", ref.getCreationDate());
  console.log("Modification Date:", ref.getModificationDate());
  console.log("\n########################################################\n");
};

const updateMetaData = (ref, { title, fileRefer }) => {
  ref.setTitle(title);
  ref.setKeywords(["PDF", "TMLTH Connect"]);
  ref.setAuthor("Tokio marine Life Insurance (Thailand) PCL.");
  ref.setSubject(title + " - v" + fileRefer);
  ref.setModificationDate(new Date());
  ref.setProducer("Riverpark Consultant Co.,Ltd");
};

const embedImageAsync = async ({ ref, mimeType, imageBytes }) => {
  let imageSrc;
  switch (mimeType) {
    case "data:image/jpeg;base64":
      imageSrc = await ref.embedJpg(imageBytes);
      break;

    case "data:image/png;base64":
      imageSrc = await ref.embedPng(imageBytes);
      break;

    default:
      break;
  }

  return imageSrc;
};

module.exports = {
  removeEditorWaterMask,
  readDocumentMetadata,
  updateMetaData,
  embedImageAsync,
  addWaterMask,
  addWaterLogoAsync,
  addPassword,
};
