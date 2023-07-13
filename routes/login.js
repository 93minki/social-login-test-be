const express = require("express");
const router = express.Router();
const axios = require("axios");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const secretKey = process.env.TOKEN_SECRET;

router.post("/local", async (req, res) => {
  const { email, password } = req.body;

  const filePath = path.join(__dirname, "..", "db", "user.json");
  const users = JSON.parse(fs.readFileSync(filePath));
  const userList = Object.keys(users);

  if (userList.includes(email)) {
    if (users[email].password === password) {
      const token = jwt.sign(
        {
          type: "JWT",
          email,
        },
        secretKey,
        {
          expiresIn: "15m",
          issuer: "minki",
        }
      );
      res.status(200).json({
        code: 200,
        message: "로컬 토큰 받아라",
        user: {
          email,
          name: users[email].name,
          profile_image:
            "http://k.kakaocdn.net/dn/dpk9l1/btqmGhA2lKL/Oz0wDuJn1YV2DIn92f6DVK/img_640x640.jpg",
          id: Math.random(),
        },
        jwt: token,
      });
    } else {
      // 비밀번호 틀림
      res.status(401).json({
        code: 401,
        message: "비밀번호랑 이메일중 뭘 틀렸을까",
      });
    }
  } else {
    // 오류
    res.status(401).json({
      code: 404,
      message: "가입부터 하셈!",
    });
  }
});

router.post("/kakao", async (req, res) => {
  const code = req.body.code;
  try {
    const tokenData = await axios.post(
      "https://kauth.kakao.com/oauth/token",
      {
        code,
        client_id: process.env.KAKAO_CLIENT_ID,
        grant_type: "authorization_code",
        client_secret: process.env.KAKAO_CLIENT_SECRET,
        redirect_uri: process.env.KAKAO_CALLBACK_URI,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      }
    );
    console.log("tokenData", tokenData.data);
    const {
      access_token,
      expires_in,
      refresh_token,
      refresh_token_expires_in,
      scope,
      token_type,
    } = tokenData.data;

    const token = jwt.sign(
      {
        type: "JWT",
        access_token,
        expires_in,
        refresh_token,
        refresh_token_expires_in,
      },
      secretKey,
      {
        expiresIn: "15m",
        issuer: "minki",
      }
    );

    const userData = await axios.post(
      "https://kapi.kakao.com/v2/user/me",
      {},
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      }
    );

    const {
      id,
      properties: { nickname: name, profile_image },
      kakao_account: { email },
    } = userData.data;

    const user = {
      id,
      name,
      profile_image,
      email,
    };

    // DB 저장
    const filePath = path.join(__dirname, "..", "db", "user.json");
    const users = JSON.parse(fs.readFileSync(filePath));
    const userList = Object.keys(users);

    if (!userList.includes(email)) {
      // 미가입 사용자
      users[email] = {
        name,
        profile_image,
      };

      fs.writeFileSync(filePath, JSON.stringify(users));
    }

    res.status(200).json({
      code: 200,
      message: "카카오 토큰 받아라!",
      user,
      jwt: token,
    });
  } catch (error) {
    res.send("카카오 로그인 에러!");
  }
});

router.post("/naver", async (req, res) => {
  const { code, state } = req.body;
  try {
    const tokenData = await axios.get(
      `https://nid.naver.com/oauth2.0/token?client_id=${process.env.NAVER_CLIENT_ID}&client_secret=${process.env.NAVER_CLIENT_SECRET}&grant_type=authorization_code&state=${state}&code=${code}`
    );
    console.log("tokenData result", tokenData.data);
    const { access_token, refresh_token, token_type, expires_in } =
      tokenData.data;

    const token = jwt.sign(
      {
        type: "JWT",
        access_token,
        refresh_token,
        expires_in,
      },
      secretKey,
      {
        expiresIn: "15m",
        issuer: "minki",
      }
    );

    const userData = await axios.post(
      "https://openapi.naver.com/v1/nid/me",
      {},
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    console.log("Naver User Data", userData.data);
    const { id, profile_image, email, name } = userData.data.response;
    const user = {
      id,
      name,
      profile_image,
      email,
    };

    const filePath = path.join(__dirname, "..", "db", "user.json");
    const users = JSON.parse(fs.readFileSync(filePath));
    const userList = Object.keys(users);

    if (!userList.includes(email)) {
      users[email] = {
        name,
        profile_image,
      };

      fs.writeFileSync(filePath, JSON.stringify(users));
    }

    res.status(200).json({
      code: 200,
      jwt: token,
      user,
      message: "네이버 토큰 받아라!",
    });
  } catch (error) {
    console.error(error);
    res.send("네이버 로그인 에러!");
  }
});

module.exports = router;
