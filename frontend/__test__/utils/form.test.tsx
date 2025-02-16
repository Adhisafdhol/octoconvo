import { createSignupOnSubmit } from "@/utils/form";

const errorObj = {
  message: "Failed to sign up",
  error: {
    validationError: [
      {
        field: "username",
        msg: "Username is already taken",
        value: "test_user_1",
      },
    ],
  },
};

const successObj = {
  message: "Successfully created a new account",
  user: {
    id: "12345678",
  },
};

type Config = { body: URLSearchParams };
global.fetch = jest.fn((_url, config: Config) => {
  if (config.body.get("username") === "ERROR") {
    return Promise.resolve().then(() => {
      throw new TypeError("Network Error");
    });
  }
  return Promise.resolve({
    status: config.body.get("username") === "test_user_1" ? 422 : 200,
    json: () =>
      Promise.resolve(
        config.body.get("username") === "test_user_1" ? errorObj : successObj
      ),
  });
}) as jest.Mock;

describe("Test createSignupOnSubmit function", () => {
  it("Run errorHandler when response status >= 400", async () => {
    const errorHandler = jest.fn(() => console.log());
    const successHandler = jest.fn();
    const signupSubmit = createSignupOnSubmit({ errorHandler, successHandler });

    const mockData = {
      username: "test_user_1",
      password: "Test_123",
    };
    await signupSubmit(mockData);
    expect(errorHandler).toHaveBeenCalled();
  });

  it("Run successHandler when response status < 400", async () => {
    const errorHandler = jest.fn(() => {});
    const successHandler = jest.fn(() => {});
    const signupSubmit = createSignupOnSubmit({
      errorHandler,
      successHandler,
    });

    const mockData = {
      username: "test_user_2",
      password: "Test_123",
    };
    await signupSubmit(mockData);
    expect(successHandler).toHaveBeenCalled();
  });

  describe("Test createSignupOnSubmit function", () => {
    it("Run errorHandler when response status >= 400", async () => {
      const errorHandler = jest.fn((err) => console.log(err));
      const successHandler = jest.fn();
      const signupSubmit = createSignupOnSubmit({
        errorHandler,
        successHandler,
      });

      const mockData = {
        username: "test_user_1",
        password: "Test_123",
      };
      await signupSubmit(mockData);
      expect(errorHandler).toHaveBeenCalled();
    });

    it("Catch err if fetch throw an error", async () => {
      const errorHandler = jest.fn(() => {});
      const successHandler = jest.fn(() => {});
      const signupSubmit = createSignupOnSubmit({
        errorHandler,
        successHandler,
      });

      const mockData = {
        username: "ERROR",
        password: "Test_123",
      };

      jest.spyOn(console, "log").mockImplementation();
      await signupSubmit(mockData);
      expect(console.log).toHaveBeenCalledTimes(2);
      expect(console.log).toHaveBeenCalledWith("Network Error");
    });
  });
});
