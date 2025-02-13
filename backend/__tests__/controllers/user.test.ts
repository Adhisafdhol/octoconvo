import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import passportConfig from "../../config/passportConfig";
import * as userController from "../../controllers/user";
import request from "supertest";
import { deleteUserByUsername } from "../../database/prisma/userQueries";

const app = express();

app.use(
  session({
    cookie: {
      secure: false,
    },
    secret: "test",
    resave: false,
    saveUninitialized: true,
  }),
);
app.use(passportConfig.session());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/account/signup", userController.user_sign_up_post);

describe("Test user signup using local strategy", () => {
  afterAll(async () => {
    await deleteUserByUsername("test_user_1");
  });

  test("Successfully create an account if all fields passed the validation", done => {
    request(app)
      .post("/account/signup")
      .type("form")
      .send({
        username: "test_user_1",
        password: "test_A1_",
      })
      .expect("Content-Type", /json/)
      .expect(res => {
        const user = res.body.user;
        const message = res.body.message;

        expect(message).toEqual("Successfully signed up as test_user_1");
        expect(user.id).toBeTruthy();
      })
      .expect(200, done);
  });

  test("Failed to create an account username is already taken", done => {
    request(app)
      .post("/account/signup")
      .type("form")
      .send({
        username: "test_user_1",
        password: "test_password_1",
      })
      .expect("Content-Type", /json/)
      .expect(res => {
        const message = res.body.message;
        const error = res.body.error;
        expect(message).toEqual("Failed to create a new account");
        expect(error.validationError[0]).toStrictEqual({
          field: "username",
          value: "test_user_1",
          msg: "Username is already taken",
        });
      })
      .expect(422, done);
  });

  test("Failed to create an account if username contains more than 32 characters", done => {
    request(app)
      .post("/account/signup")
      .type("form")
      .send({
        username: "Thisisareallylongstringcharactertotestlongstringusername",
        password: "test_password_1",
      })
      .expect("Content-Type", /json/)
      .expect(res => {
        const message = res.body.message;
        const error = res.body.error;
        expect(message).toEqual("Failed to create a new account");
        expect(error.validationError[0].msg).toEqual(
          "Username must not exceed 32 characters",
        );
      })
      .expect(422, done);
  });

  test("Failed to create an account if username contains forbidden characters", done => {
    request(app)
      .post("/account/signup")
      .type("form")
      .send({
        username: "hi.hi",
        password: "test_password_1",
      })
      .expect("Content-Type", /json/)
      .expect(res => {
        const message = res.body.message;
        const error = res.body.error;
        expect(message).toEqual("Failed to create a new account");
        expect(error.validationError[0].msg).toEqual(
          "Username must only contain alphanumeric characters and underscores",
        );
      })
      .expect(422, done);
  });

  test("Failed to create an account if password less than 8 characters", done => {
    request(app)
      .post("/account/signup")
      .type("form")
      .send({
        username: "test_user_2",
        password: "123",
      })
      .expect("Content-Type", /json/)
      .expect(res => {
        const message = res.body.message;
        const error = res.body.error;
        expect(message).toEqual("Failed to create a new account");
        expect(error.validationError[0].msg).toEqual(
          "Password must contain at least 8 characters",
        );
      })
      .expect(422, done);
  });

  test(
    "Failed to create an account if password doesn't contain at least one digit, one lowercase letter," +
      "one uppercase letter, and one special character",
    done => {
      request(app)
        .post("/account/signup")
        .type("form")
        .send({
          username: "test_user_2",
          password: "Test_user",
        })
        .expect("Content-Type", /json/)
        .expect(res => {
          const message = res.body.message;
          const error = res.body.error;
          expect(message).toEqual("Failed to create a new account");
          expect(error.validationError[0].msg).toEqual(
            "Password must contain at least one digit, one lowercase letter, one uppercase letter," +
              "and one special character",
          );
        })
        .expect(422, done);
    },
  );
});

export default app;
