const palindromo = require("../utils/palindromo");

test("el palindromo de fernando", () => {
  const result = palindromo("ferna");

  expect(result).toBe("anref");
});

describe("palindromo", () => {
  test("el palindromo de fernando", () => {
    const result = palindromo("ferna");
    expect(result).toBe("anref");
  });
  test("el palindromo de petroca", () => {
    const result = palindromo("petroca");
    expect(result).toBe("acortep");
  });
});
