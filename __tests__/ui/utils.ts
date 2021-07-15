import { chromium, Page } from "playwright"

export async function login(page: Page){
  page.type("id=username", "demo123");
  page.type("id=password", "s3c4t%%43");
  page.click("id=loginBtn");
}

export async function applyForm(page: Page) {
  page.click("name=Create new application");
  page.click("name=Get started");
}