const Jimp = require("jimp");
const _ = require("lodash");

function bufferFromBase64(base64String) {
  return Buffer.from(base64String, "base64");
}

const compressImageAsync = async ({
  bufferOrUrl,
  quality = 50,
  base64,
  skipped,
}) => {
  try {
    let buffer = bufferOrUrl;

    if (_.startsWith(bufferOrUrl, "data:image/")) {
      const splits = bufferOrUrl.split(",");
      buffer = bufferFromBase64(splits[splits?.length - 1]);
    }

    const image = await Jimp.read(buffer);
    const mimeType = image.getMIME();

    const originalBuffer = await image.getBufferAsync(mimeType);
    const originalSize = Buffer.byteLength(originalBuffer);

    if (!skipped) image.quality(quality);

    const source = await image.getBufferAsync(mimeType);
    const compressedSize = Buffer.byteLength(source);

    const compressedBase64 = await image.getBase64Async(mimeType);

    return {
      source: base64 ? compressedBase64.split(",")?.[1] : source,
      mimeType: compressedBase64.split(",")?.[0],
      _mimeType: mimeType,
      originalSize,
      compressedSize,
      base64,
    };
  } catch (err) {
    throw err;
  }
};

module.exports = { compressImageAsync };
