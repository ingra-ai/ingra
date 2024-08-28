import { generateToken, decodeToken } from "@repo/shared/lib/tokens";
import jwt from "jsonwebtoken";

describe("Token functions", () => {
  const mockJwtSign = jest.fn().mockReturnValue("mockToken");
  const mockJwtVerify = jest.fn().mockReturnValue({ data: "mockPayload" });

  beforeAll(() => {
    jwt.sign = mockJwtSign;
    jwt.verify = mockJwtVerify;
    process.env.JWT_SECRET = "testSecret";
  });

  it("should generate a token", () => {
    const payload = { data: "test" };
    const token = generateToken(payload, 180);

    expect(token).toBe("mockToken");
    expect(mockJwtSign).toHaveBeenCalledWith(payload, "testSecret", {
      expiresIn: 180,
    });
  });

  it("should decode a token", () => {
    const token = "mockToken";
    const payload = decodeToken<{ data: string }>(token);

    expect(payload).toEqual({ data: "mockPayload" });
    expect(mockJwtVerify).toHaveBeenCalledWith(token, "testSecret");
  });

  it("should return null when decoding fails", () => {
    mockJwtVerify.mockImplementationOnce(() => {
      throw new Error("Decoding failed");
    });
    const payload = decodeToken<{ data: string }>("mockToken");

    expect(payload).toBeNull();
  });
});
