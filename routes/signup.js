const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

router.post("/", async (req, res) => {
  const { email, password, name } = req.body;

  const filePath = path.join(__dirname, "..", "db", "user.json");
  const users = JSON.parse(fs.readFileSync(filePath));
  const userList = Object.keys(users);

  if (!userList.includes(email)) {
    users[email] = {
      name,
      password,
      profile_image:
        "http://k.kakaocdn.net/dn/dpk9l1/btqmGhA2lKL/Oz0wDuJn1YV2DIn92f6DVK/img_640x640.jpg",
    };
    fs.writeFileSync(filePath, JSON.stringify(users));

    res.status(200).json({
      code: 200,
      message: "회원가입 성공",
    });
  } else {
    res.status(404).json({
      code: 404,
      message: "이미 가입된 이메일입니다!",
    });
  }
});

module.exports = router;
