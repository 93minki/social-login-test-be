# social-login-test-be

Kakao 애플리케이션 등록 후 Client ID, Secret 발급 필요.

Naver 애플리케이션 등록 후 Client ID, Secret 발급 필요.

발급받은 key를 .env 파일에 저장해야 함.

```
TOKEN_SECRET=

KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
KAKAO_CALLBACK_URI=

NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
```

소셜 로그인, 또는 로컬 로그인시 유저 정보가 /db/user.json 파일에 저장됨.

소셜 회원, 로컬 회원 email을 key로 사용해서 중복 회원가입 방지.

소셜 이메일로 로컬 회원가입시 이미 가입된 사용자로 판단.
