import http from "http";
import querystring from "querystring";

const sendSMS = ({ mobile: mobile, body: body }) => {
  const params = {
    authkey: process.env.SMS_AUTH_KEY,
    mobiles: mobile,
    message: body,
    sender: process.env.SMS_SENDER_ID,
    route: process.env.SMS_ROUTE,
    country: 91,
    DLT_TE_ID: "1207164076579233127",
  };
  const queryParams = querystring.stringify(params);
  const options = {
    method: "POST",
    hostname: "sms.moplet.com",
    port: null,
    path: "/api/sendhttp.php?" + queryParams,
  };
  const req = http.request(options, function (res) {
    var chunks = [];
    res.on("data", function (chunk) {
      chunks.push(chunk);
    });
    res.on("end", function () {
      const body = Buffer.concat(chunks);
    });
  });
  req.end();
};

export default sendSMS;
