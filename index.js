const puppeteer = require("puppeteer");
const fs = require("fs");

const cookiesString = fs.readFileSync("cookies.json");
const parsedCookies = JSON.parse(cookiesString);

async function waitForGptResponse(page) {
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
        console.log("Reply is being generated...");
        return true;
      }
    },
    { timeout: 0 }
  );

  // Second marks the end of the generation of reply
  await page.waitForResponse(
    async (response) => {
      const isConversationResponse =
        response
          .url()
          .startsWith("https://chat.openai.com/backend-api/conversations") &&
        response.status() === 200 &&
        response.url().endsWith("order=updated");

      const isConversationResponseWithReply =
        response
          .url()
          .startsWith("https://chat.openai.com/backend-api/lat/r") &&
        response.status() === 200;
      if (isConversationResponse || isConversationResponseWithReply) {
        // console.log(response.url());
        console.log("Reply has been generated!");
        return true;
      }
    },
    { timeout: 0 }
  );
}

async function promptGpt(page, prompt) {
  await page.waitForSelector("textarea#prompt-textarea");

  await page.keyboard.type(prompt);
  await page.keyboard.press("Enter");

  await page.waitForTimeout(500);

  await waitForGptResponse(page);

  const gptResponse = await page.evaluate(() => {
    const messages = document.querySelectorAll("div.text-token-text-primary");
    const reply = messages[messages.length - 1].innerText; // The last inserted div contains the reply
    console.log("GPT RESPONSE: ", reply);
    return reply;
  });

  return gptResponse;
}

async function main() {
  // Load browser, page and cookies

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

  await page.waitForTimeout(2000);

  const prompts = [
    "What is the meaning of life?",
    "Who is the best basketball player of all time?",
    "What is the best movie of all time?",
    "What is the best programming language?",
    "What is the best programming language for machine learning?",
  ];

  for (let i = 0; i < 5; i++) {
    console.log("Init Prompt: " + i);
    await page.waitForTimeout(500);
    await promptGpt(page, prompts[i]);
    console.log("Done Prompt: " + i);
  }
}

main();
