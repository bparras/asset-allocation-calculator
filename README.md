# Asset Allocation Calculator

A responsive cryptocurrency allocation calculator built with **Vue 3, TypeScript, and Vite**. It calculates how a fiat investment would be split between Bitcoin and Ethereum using Coinbase reference exchange rates.

_Author:_ Brian Parras

## Getting started

To run project:
```bash
npm install
npm run dev
```

```bash
npm test        # Run tests
npm run build   # Type-check and create a production build
```

## Features

- Enter an investment amount (USD, EUR, GBP) and get BTC/ETH quantities for that fiat amount.
- Adjust allocation using a percentage slider or using percent inputs (default 70% BTC / 30% ETH).
- View fiat allocations and estimated crypto quantities using Coinbase's public exchange-rate endpoint.
- Rates auto refresh every 30 seconds with loading, error, and retry states and there is a manual refresh option
- Persist the investment amount, selected currency, and allocation percentage in local storage.

## Design Decisions and Tradeoffs

**One value controls the split**

The calculator uses a primary percent value (BTC) to manage the allocation between two assets. The second asset always receives the remaining percentage. This simplifies state management and ensures allocations total 100%. Percentages are whole numbers which avoids decimal precision issues.

Tradeoffs:
- UX was designed to split between 2 assets. Supporting three or more assets would require a different allocation model and rules for redistributing percentages when an asset is edited.
- Less precision without percent decimals

**Derived allocation values**

Calculations for fiat allocations and crypto quantities are all done within the page state and are computed properties rather than stored as separate states. This keeps state simple and values are synchronized without needing watchers.

Tradeoffs:
- Allocation calculations are tied to the page state. More complex calculations may need to be extracted into reusable utilities.

**Input handling and precision**
- Calculations use the "convert to cents" strategy by converting dollars to cents to avoid floating point errors. This approach is good enough for this case but woudn't work with financial scenarios where precision is necessary.
ex: $100.01 split 50/50 is $50.01 + $50.00
- Used text input instead of a number input to have more control over decimal precision and formatting. Input values are sanitized while typing and validated before calculations.
- Fiat allocations are rounded to two decimal places, with the second asset receiving the remaining amount to avoid rounding discrepancies. Crypto quantities are displayed with up to eight decimal places.
- Commas are removed to keep parsing simple.

Tradeoffs:
- Harder to see larger input amounts without commas and currency formats that use commas may have unexpected behavior.
- Less flexibility when users want to type non-numeric characters.
- Loss of precision for very small numbers for both fiat and crypto quantities.

**Exchange-rate fetching**

- Exchange rates are fetched through a composable that manages loading, errors, request cancellation, and polling. The calculator uses short polling and refreshes rates every 30 seconds and a manual refresh is also available.

Tradeoffs:
- Polling may be wasteful and not update rates because coinbase exchange rate endpoint doesn't update that frequently

**UI components**

- Prioritize using as much native HTML elements as possible to keep project light and minimize dependencies.
- Used native input range slider instead of a component library to keep bundle size small.

Tradeoff:
- More overhead building a component instead of using a library
- Less functionality and fidelity than a library component

**Application architecture**

- Code is organized by responsibility so the pages and components handle the UI, services calls the API, composables manage exchange-rate state, utils hold calculations, formatting and storage, and types hold shared types.
- Did not include router or external state management since the application is only a single page and state was management with just component state.

Tradeoff:
- All of the inputs and calculations are stored in component state. As the application grows and becomes more complex, it may need centralized state but for this case it seemed unnecessary.

**Accessibility and responsive UI**
- Built with accessibility in mind by having native form controls, visible focus states, labels on every input.
- Added typed percent inputs as an alternative to dragging the slider.
- Errors show as text and are announced.
- The layout stacks for smaller screens and mobile.

**Performance**
- Vue is the only runtime dependency
- A new rate request cancels the previous one, so stale responses can't overwrite newer rates.
- Calculated values are computed rather than stored

**Testing**
- Prioritized input and calculation logic over testing of visual components
- Focused on testing allocation calculations, rounding, input validation, and API response parsing. These were the areas where there would most likely be incorrect results or behavior.
