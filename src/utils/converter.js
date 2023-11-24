const _ = require("lodash");
let temp = [];

const cvtArabicToThai = (text) => {
  const th = {
    1: "๑",
    2: "๒",
    3: "๓",
    4: "๔",
    5: "๕",
    6: "๖",
    7: "๗",
    8: "๘",
    9: "๙",
    0: "๐",
  };
  const newText = text?.split("").map((c) => (th?.[c] ? th[c] : c));
  return newText;
};

const cvtThaiToArabic = (text) => {
  const th = {
    "๑": 1,
    "๒": 2,
    "๓": 3,
    "๔": 4,
    "๕": 5,
    "๖": 6,
    "๗": 7,
    "๘": 8,
    "๙": 9,
    "๐": 0,
  };
  const newText = text?.split("").map((c) => (th?.[c] ? th[c] : c));
  return newText;
};

const cvtCheckBoxValue = (text) => {
  const _text = cvtThaiToArabic(text);

  switch (_text?.join("")) {
    // education
    case "ปริญญาตรี":
      return "opt2";
    case "สูงกว่าปริญญาตรี":
      return "opt3";
    case "ต่ำกว่าปริญญาตรี":
      return "opt1";
    // ตช1
    case "ขอรับครั้งแรก":
      return "t1";
    case "ขาดต่อ/ขอรับใบอนุญาตใหม่":
      return "t2";
    case "ขอรับมากกว่า 1 บริษัท":
      return "t3";
    case "ย้ายบริษัท":
      return "t4";
    case "ใบแทนใบอนุญาต":
      return "t5";

    // insure
    case "ประกันชีวิต":
      return "life_insurance";
    case "ประกันวินาศภัย":
      return "non-life_insurance";
    // ที่อยู่
    case "ที่อยู่อื่น":
      return "opt2";
    case "ที่ตามทะเบียนบ้าน":
      return "opt1";

    // ตช1
    case "ตัวแทนประกันวินาศภัย":
      return "opt1";
    case "ตัวแทนประกันวินาศภัยสำหรับการประกันภัยรายย่อย":
      return "opt2";
    case "ตัวแทนประกันวินาศภัยสำหรับการประกันภัยอุบัติเหตุส่วนบุคคลและประกันสุขภาพ":
      return "opt3";
    case "ตัวแทนประกันวินาศภัยสำหรับการประกันภัยความคุ้มครองตามพระราชบัญญัติคุ้มครองผู้ประสบภัยจากรถ":
      return "opt4";

    //ขอขึ้น,ขอต่อ ILP
    case "ขอขึ้นทะเบียน":
      return "opt1";
    case "ต่ออายุการขึ้นทะเบียน":
      return "opt2";

    default:
      return text;
  }
};

const jsonKeysToString = (json, prefix = "") => {
  let _output = {};

  const _prefix = cvtThaiToArabic(prefix)?.join("");

  for (let key in json) {
    let value = json[key];

    if (key.toLocaleLowerCase() === "cid") {
      const _cid = {};

      // cvtArabicToThai(value?.replace(/-/g, ""))?.map(
      //   (n, i) => (_cid["NO_" + i] = n.toString())
      // );

      value
        ?.replace(/-/g, "")
        .split("")
        ?.map((n, i) => (_cid["NO_" + i] = n.toString()));
      value = _cid;
    } else if (key.toLocaleLowerCase() === "bankno") {
      const _cid = {};

      // cvtArabicToThai(value?.replace(/-/g, ""))?.map(
      //   (n, i) => (_cid["NO_" + i] = n.toString())
      // );

      value
        ?.replace(/-/g, "")
        .split("")
        ?.map((n, i) => (_cid["NO_" + i] = n.toString()));
      value = _cid;
    }
    const newPrefix = _prefix
      ? `${_prefix}:${_.snakeCase(key).toUpperCase()}`
      : `${_.snakeCase(key).toUpperCase()}`;

    if (typeof value === "object" && value !== null) {
      jsonKeysToString(value, newPrefix);
    } else {
      // const _value = cvtArabicToThai(value).join("");

      _output[newPrefix] = value?.toString();
    }
  }
  temp.push(_output);
  const output = Object.assign({}, ...temp);

  return output;
};

const resetTemp = () => {
  temp = [];
};

module.exports = {
  jsonKeysToString,
  cvtThaiToArabic,
  cvtArabicToThai,
  cvtCheckBoxValue,
  resetTemp,
};
