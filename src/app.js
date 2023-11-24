require("dotenv").config();

const dayjs = require("dayjs");
require("dayjs/locale/th");
const buddhistEra = require("dayjs/plugin/buddhistEra");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(buddhistEra);
dayjs.locale("th");
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Bangkok");

const amqp = require("amqplib");
const cors = require("cors");
const morgan = require("morgan");

const constants = require("./constants");
const watcher = require("./services/amqp");
const routes = require("./routes");
const pck = require("../package.json");
const PdfServices = require("./services/pdf");
const converters = require("./utils/converter");
const PdfHelpers = require("./utils/pdf");
const ImgHelpers = require("./utils/image");
const { handleSuccess, handleError } = require("./middleware/response");

const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cors());
app.use(
  morgan("combined", {
    skip: function (req, res) {
      return res.statusCode < 400;
    },
  })
);

app.use(function (req, res, next) {
  // res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  // res.header("Content-Security-Policy", "default-src 'self'");
  res.removeHeader("X-Powered-By");
  next();
});
app.use((req, res, next) => {
  req.ctx = {
    services: { pdf: PdfServices },
    utils: { converters },
    helpers: { pdf: PdfHelpers, image: ImgHelpers },
  };

  req.constants = constants;
  req.responseError = handleError;
  req.responseSuccess = handleSuccess;

  next();
});

// app.use(`${constants?.nginxContext}`, routes);
app.use(`/utility`, routes);

app.use("*", (req, res) => {
  req.responseError(res, "API not found.");
});

server.listen(constants.appPort, async () => {
  // const connect = await amqp.connect(constants.amqpConnect);
  // const Listener = await connect.createChannel();
  // watcher({ Listener }, constants.amqpNodeQSocket);
  // console.log(`*********************************************************\n`);
  // console.log(
  //   `(0)Nginx Context\t:\t [$ROOT]${constants.nginxContext}/[$routes]`
  // );
  // console.log(`(1)Service: Port \t:\t ${constants.appPort}`);
  // console.log(`(2)Service: Q Running\t:\t ${constants.amqpNodeQSocket}`);
  // console.log(`(3)Service: Q Connect\t:\t ${constants.amqpNodeAPI}`);
  // console.log(`(4)Service Started\t:\t version ${pck.version}`);
  // console.log(`\n********************************************************`);
});
