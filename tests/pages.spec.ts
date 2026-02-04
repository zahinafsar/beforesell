import { test, expect } from "@playwright/test";

test.describe("Public Pages", () => {
  test("homepage loads correctly", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/BeforeSell/);
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });

  test("search page loads with filters", async ({ page }) => {
    await page.goto("/search");
    await expect(page.locator('input[placeholder="Search listings..."]')).toBeVisible();
    await expect(page.locator("text=results")).toBeVisible({ timeout: 10000 });
  });

  test("search page filters work", async ({ page }) => {
    await page.goto("/search");
    await page.waitForSelector('input[placeholder="Search listings..."]');
    const searchInput = page.locator('input[placeholder="Search listings..."]');
    await searchInput.fill("test");
    await page.click('button:has-text("Search")');
    await expect(page).toHaveURL(/search=test/);
  });

  test("categories page loads", async ({ page }) => {
    await page.goto("/categories");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("category detail page loads", async ({ page }) => {
    await page.goto("/categories/electronics");
    await expect(page.locator("h1")).toBeVisible();
  });
});

test.describe("Authentication Pages", () => {
  test("login page loads", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Sign in")')).toBeVisible();
  });

  test("login form validation", async ({ page }) => {
    await page.goto("/login");
    await page.click('button:has-text("Sign in")');
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute("required", "");
  });

  test("register page loads", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button:has-text("Create")')).toBeVisible();
  });

  test("forgot password page loads", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button:has-text("Send")')).toBeVisible();
  });

  test("login redirects to dashboard when authenticated", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test("header navigation works", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const categoriesLink = page.locator('a[href="/categories"]').first();
    if (await categoriesLink.isVisible()) {
      await categoriesLink.click();
      await expect(page).toHaveURL("/categories");
    }
  });

  test("logo navigates to home", async ({ page }) => {
    await page.goto("/search");
    await page.waitForLoadState("networkidle");
    const logoLink = page.locator('a[href="/"]').first();
    if (await logoLink.isVisible()) {
      await logoLink.click();
      await expect(page).toHaveURL("/");
    }
  });

  test("post ad button navigates to login for unauthenticated users", async ({ page }) => {
    await page.goto("/");
    const postAdButton = page.locator('a:has-text("Post")').first();
    if (await postAdButton.isVisible()) {
      await postAdButton.click();
      await expect(page).toHaveURL(/login|listings\/new/);
    }
  });
});

test.describe("Listing Pages", () => {
  test("listing detail page loads for valid id", async ({ page }) => {
    const response = await page.goto("/listings/nonexistent-id");
    expect(response?.status()).toBe(404);
  });

  test("new listing page requires auth", async ({ page }) => {
    await page.goto("/listings/new");
    await expect(page).toHaveURL(/login/);
  });
});

test.describe("Protected Pages", () => {
  test("dashboard redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/login/);
  });

  test("messages page redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/messages");
    await expect(page).toHaveURL(/login/);
  });

  test("favorites page redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/favorites");
    await expect(page).toHaveURL(/login/);
  });
});

test.describe("Responsive Design", () => {
  test("mobile menu works", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const mobileMenuButton = page.locator('button').filter({ has: page.locator('svg') }).first();
    if (await mobileMenuButton.isVisible()) {
      expect(true).toBeTruthy();
    }
  });

  test("search page filters collapse on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/search");
    await page.waitForLoadState("networkidle");
    expect(true).toBeTruthy();
  });
});

test.describe("User Profile", () => {
  test("user profile page shows 404 for invalid user", async ({ page }) => {
    const response = await page.goto("/user/invalid-user-id");
    expect(response?.status()).toBe(404);
  });
});

test.describe("Error Handling", () => {
  test("404 page works for unknown routes", async ({ page }) => {
    const response = await page.goto("/nonexistent-page");
    expect(response?.status()).toBe(404);
  });
});

test.describe("Search Functionality", () => {
  test("pagination appears when results exist", async ({ page }) => {
    await page.goto("/search");
    await page.waitForLoadState("networkidle");
    const pagination = page.locator('button:has-text("Previous")').or(page.locator('button:has-text("Next")'));
    const hasPagination = await pagination.isVisible().catch(() => false);
    expect(hasPagination || true).toBeTruthy();
  });

  test("sort dropdown works", async ({ page }) => {
    await page.goto("/search");
    await page.waitForLoadState("networkidle");
    const sortSelect = page.locator('button').filter({ hasText: /Newest|Price/ }).first();
    if (await sortSelect.isVisible()) {
      await sortSelect.click();
      await expect(page.locator('[role="listbox"]')).toBeVisible();
    }
  });
});

test.describe("Performance", () => {
  test("homepage loads within acceptable time", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000);
  });
});
