The [Working Patterns Library](https://cityofnewyork.github.io/workingnyc-patterns/) was created by leveraging the stylesheet established by the [Workforce Data Portal](https://workforcedata.nyc.gov/en/) (designed by Blenderbox) and applying design tokens from that project onto a fork of the [ACCESS Patterns](https://accesspatterns.cityofnewyork.us/). This fork was refactored and standardized into a more universal set of patterns for new products with the same structure as ACCESS NYC and Working NYC.

The UI for [ACCESS NYC](https://access.nyc.gov) is well established and based on an early version (v1) of the [U. S. Web Design System (USWDS)](https://designsystem.digital.gov/). Since the launch of ACCESS NYC, its UI has branched off into its own set of patterns. However, the UX guides for components from the USWDS are still used to guide their implementation in other ACCESS NYC properties.

The contents of the library include;

* [Elements](https://github.com/CityOfNewYork/working-nyc-patterns/tree/main/src/elements) – Web primitives including inputs, buttons, links, tables, icons, etc.

* [Components](https://github.com/CityOfNewYork/working-nyc-patterns/tree/main/src/components) – Blocks that include elements, arranging them in specific layouts that may be repeated on a page. Cards, questions, alerts, dropdowns, etc.

* [Objects](https://github.com/CityOfNewYork/working-nyc-patterns/tree/main/src/objects) – Blocks with dynamic functionality and may appear once on a page or take up the entire view.

* [Utilities](https://github.com/CityOfNewYork/working-nyc-patterns/tree/main/src/utilities) – Design tokens mapped to CSS selectors for modifying the tokens of other patterns depending on the need of the view. The majority of utilities are made available through the customization of a Tailwindcss library.

* [Demonstration Pages](#demo-pages) – The demo site showcases these patterns in action for teams to reference.

The patterns have been built using the **NYCO Patterns Framework** and the [Patterns CLI](https://github.com/CityOfNewYork/patterns-cli).