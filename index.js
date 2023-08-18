const puppeteer = require("puppeteer");
const fs = require("fs");
const { getPrompts } = require("./prompts");

const cookiesString = fs.readFileSync("cookies.json");
const parsedCookies = JSON.parse(cookiesString);

async function waitForGptResponse(page) {
  // This response marks the end of the GPT response
  await page.waitForResponse(
    async (response) => {
      const isConversationResponseWithReply =
        response
          .url()
          .startsWith("https://chat.openai.com/backend-api/lat/r") &&
        response.status() === 200;
      if (isConversationResponseWithReply) {
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

async function writeToJsonFile(data, filename) {
  await fs.writeFileSync(filename, JSON.stringify(data, null, 2));
}

async function main() {
  // Load browser, page and cookies

  const gptResponses = [];

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

  const prompts = getPrompts();

  for (let i = 0; i < prompts.length; i++) {
    console.log("Init Prompt: " + (i + 1));
    await page.waitForTimeout(1000);
    const reply = await promptGpt(page, prompts[i]);
    gptResponses.push(reply.substring(9)); // substring to remove the "CHATGPT\n\n" part
    await writeToJsonFile(gptResponses, "data.json");
    console.log("Done Prompt: " + (i + 1));
  }

  await browser.close();
}

main();
