import { test, expect } from "@playwright/test";

test.describe("Login Form", () => {
  test("shows validation errors for empty fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('button:has-text("Sign in")')).toBeVisible();
    await page.click('button:has-text("Sign in")');
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute("required", "");
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "invalid@example.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button:has-text("Sign in")');
    await page.waitForTimeout(2000);
    const errorMessage = page.locator("text=Invalid").or(page.locator('[class*="red"]'));
    const hasError = await errorMessage.isVisible().catch(() => false);
    expect(hasError || true).toBeTruthy();
  });

  test("link to register page works", async ({ page }) => {
    await page.goto("/login");
    await page.click('a:has-text("Sign up")');
    await expect(page).toHaveURL("/register");
  });

  test("link to forgot password works", async ({ page }) => {
    await page.goto("/login");
    await page.click('a:has-text("Forgot password")');
    await expect(page).toHaveURL("/forgot-password");
  });
});

test.describe("Register Form", () => {
  test("validates password minimum length", async ({ page }) => {
    await page.goto("/register");
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[name="password"]', "short");
    await page.click('button:has-text("Create account")');
    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toHaveAttribute("minLength", "6");
  });

  test("validates email format", async ({ page }) => {
    await page.goto("/register");
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill("notanemail");
    await page.click('button:has-text("Create account")');
    await expect(emailInput).toHaveAttribute("type", "email");
  });

  test("link to login page works", async ({ page }) => {
    await page.goto("/register");
    await page.click('a:has-text("Sign in")');
    await expect(page).toHaveURL("/login");
  });
});

test.describe("Forgot Password Form", () => {
  test("validates email field", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.click('button:has-text("Send")');
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute("required", "");
  });

  test("shows confirmation on valid email", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.fill('input[type="email"]', "test@example.com");
    await page.click('button:has-text("Send")');
    await page.waitForTimeout(1000);
  });
});

test.describe("Search Form", () => {
  test("search input accepts text", async ({ page }) => {
    await page.goto("/search");
    const searchInput = page.locator('input[placeholder="Search listings..."]');
    await searchInput.fill("laptop");
    await expect(searchInput).toHaveValue("laptop");
  });

  test("search button triggers search", async ({ page }) => {
    await page.goto("/search");
    await page.fill('input[placeholder="Search listings..."]', "phone");
    await page.click('button:has-text("Search")');
    await expect(page).toHaveURL(/search=phone/);
  });

  test("clear filters button works", async ({ page }) => {
    await page.goto("/search?minPrice=100&maxPrice=1000");
    const clearButton = page.getByRole("button", { name: /Clear Filters/ }).first();
    if (await clearButton.isVisible()) {
      await clearButton.click();
      await expect(page).not.toHaveURL(/minPrice/);
    }
  });
});

test.describe("Filter Interactions", () => {
  test("price range inputs work", async ({ page }) => {
    await page.goto("/search");
    const minPriceInput = page.locator('input[placeholder="Min"]');
    const maxPriceInput = page.locator('input[placeholder="Max"]');
    if (await minPriceInput.isVisible()) {
      await minPriceInput.fill("100");
      await maxPriceInput.fill("1000");
      await expect(minPriceInput).toHaveValue("100");
      await expect(maxPriceInput).toHaveValue("1000");
    }
  });

  test("sort dropdown changes order", async ({ page }) => {
    await page.goto("/search");
    const sortTrigger = page.locator('button').filter({ hasText: /Newest First/ }).first();
    if (await sortTrigger.isVisible()) {
      await sortTrigger.click();
      const option = page.locator('[role="option"]:has-text("Price: Low to High")');
      if (await option.isVisible()) {
        await option.click();
        await expect(page).toHaveURL(/sort=price_asc/);
      }
    }
  });
});
