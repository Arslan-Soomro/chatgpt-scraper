# ChatGPT Scraper
Continuously asks chatgpt given prompts and saves repsonses to a json file.

## How to Run
Make sure you have below packages installed

- Nodejs
- npm
- Export cookie JSON file for Puppeteer Chrome Extension [https://chrome.google.com/webstore/detail/%E3%82%AF%E3%83%83%E3%82%AD%E3%83%BCjson%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E5%87%BA%E5%8A%9B-for-puppet/nmckokihipjgplolmcmjakknndddifde]

### Steps
1. Clone the repo
2. run ```npm install```
3. go to your usual browser, login to chatgpt
4. once logged in, run the export cookie json file extension
5. it will download a ```.json``` file rename it to ```cookies.json```
6. paste the ```cookies.json``` into this projects root folder
7. run command ```node index.js```

Thats it, rest will be taken care by the program itself.