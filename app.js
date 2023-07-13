const express = require("express");
const app = express();
const port = 3030;
const bodyParser = require("body-parser");

const loginRoute = require("./routes/login");
const signupRoute = require("./routes/signup");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/login", loginRoute);
app.use("/signup", signupRoute);

app.listen(port, () => {
  console.log(`서버 실행, http://localhost:${port}`);
});
