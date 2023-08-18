const puppeteer = require("puppeteer");
const fs = require("fs");

const cookiesString = fs.readFileSync("cookies.json");
const parsedCookies = JSON.parse(cookiesString);

async function getGptResponse(page) {
  await page.waitForTimeout(2000);
  await page.waitForSelector("textarea#prompt-textarea");

  await page.keyboard.type(prompt);
  await page.keyboard.press("Enter");

  await page.waitForTimeout(500);
  await page.waitForNetworkIdle();

  const gptResponse = await page.evaluate(() => {
    const messages = document.querySelectorAll("div.text-token-text-primary");
    const response = messages[messages.length - 1].innerText;
    console.log("GPT RESPONSE: ", response);
    return response;
  });
  return gptResponse;
}

async function main() {
  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: "./user_data",
  });
  const page = await browser.newPage();

  if (parsedCookies.length !== 0) {
    for (let cookie of parsedCookies) {
      await page.setCookie(cookie);
    }
  }

  await page.goto("https://chat.openai.com/", {
    waitUntil: "domcontentloaded",
  });

  const prompt = "Who is John Delon ?";

  await page.waitForTimeout(2000);
  await page.waitForSelector("textarea#prompt-textarea");

  await page.keyboard.type(prompt);
  await page.keyboard.press("Enter");

  await page.waitForTimeout(500);

  // First Response marks that start of the generation of reply
  await page.waitForResponse(
    async (response) => {
      // Print Response URL and Content
      if (
        response
          .url()
          .startsWith("https://chat.openai.com/backend-api/conversations") &&
        response.status() === 200 &&
        response.url().endsWith("order=updated")
      ) {
        // console.log(response.url());
        return true;
      }
    },
    { timeout: 0 }
  );

  // Second marks the end of the generation of reply
  await page.waitForResponse(
    async (response) => {
      if (
        response
          .url()
          .startsWith("https://chat.openai.com/backend-api/conversations") &&
        response.status() === 200 &&
        response.url().endsWith("order=updated")
      ) {
        // console.log(response.url());
        return true;
      }
    },
    { timeout: 0 }
  );

  console.log("Should Continue now!");

  const gptResponse = await page.evaluate(() => {
    const messages = document.querySelectorAll("div.text-token-text-primary");
    const reply = messages[messages.length - 1].innerText;
    console.log("GPT RESPONSE: ", reply);
    return reply;
  });

  console.log("GPTR: ", gptResponse);

  /*
  data = await page.evaluate(() => {
    const promptInput = document.querySelector("textarea#prompt-textarea");
    const submitButton = promptInput.nextElementSibling;
    console.log(promptInput);
    promptInput.value = "Who was John Delon ?";
    console.log(submitButton);
    submitButton.click();
  })
  */

  /*
    await page.waitForSelector('input[type="email"]');
    await page.screenshot({path: 'gpt.png'});
    await browser.close();
  */
}

main();
