# Selenium & Playwright Locator Strategy Cheat Sheet

Priority order for stable locators:

1. `data-testid` / `data-qa` attributes (best — immune to styling/text changes)
2. Accessible role + name (`getByRole`, ARIA label)
3. Stable `id` attributes
4. CSS class combinations that are unlikely to change with a redesign
5. Absolute/relative XPath (last resort — brittle against DOM restructuring)

## Avoid

- XPath with hardcoded indexes: `(//div[@class='row'])[3]/span`
- Locators built from dynamically generated IDs (`id="btn-8f3a91"`)
- Text-based locators for strings that are localized or A/B tested

## Self-healing pattern

Wrap locators in a Page Object method that tries a primary selector, then
falls back to a secondary one, logging a warning when the fallback is used so
flaky selectors surface in test reports instead of failing silently.
