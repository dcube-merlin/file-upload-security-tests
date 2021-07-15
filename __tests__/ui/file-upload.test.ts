import { chromium, Browser, Page } from "playwright";
import { login, applyForm } from "./utils";

const URL : string = process.env.URL || "";
const ASSETS_PATH : string = `${process.cwd()}/assets`;

describe("File upload feature", async () => {

  let browser: Browser, page: Page;
  beforeEach(async () => {
    browser = await chromium.launch();
    page = await browser.newPage();
    page.goto(URL);
    await login(page);
    await applyForm(page);
  });

  afterEach(async () => {
    page.close();
    browser.close();
  });

  it("should succeed if valid file with capitalized extension is uploaded", async () => {
    await page.setInputFiles("//input[@id='upload-file']", `${ASSETS_PATH}/sample.JPG`);
    await page.waitForSelector("id=file-remove-0", { state: 'visible' });
  });

  it("should fail with error message if file of size > 1MB is uploaded", async () => {
    await page.setInputFiles("//input[@id='upload-file']", `${ASSETS_PATH}/big-file.jpg`);
    await page.waitForSelector("text=File should be less than 1MB size.", { state: 'visible' });
  });

  it("should fail with error message if incorrect file type is uploaded", async () => {
    await page.setInputFiles("//input[@id='upload-file']", `${ASSETS_PATH}/wrong-file-format.txt`);
    await page.waitForSelector("text=Only PNG, JPEG/JPG or PDF file types allowed.", { state: 'visible' });
  });

  it("should fail with error message if double-padded extension file type is uploaded", async () => {
    await page.setInputFiles("//input[@id='upload-file']", `${ASSETS_PATH}/test.php.png`);
    await page.waitForSelector("text=Invalid file. Please try again.", { state: 'visible' });
  });

  it("should fail with error message if JPEG file with incorrect magic byte is uploaded", async () => {
    await page.setInputFiles("//input[@id='upload-file']", `${ASSETS_PATH}/fake-file-extension.jpeg`);
    await page.waitForSelector("text=Invalid file. Please try again.", { state: 'visible' });
  });
});