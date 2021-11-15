##### Global Stylesheet

Fonts are imported automatically by the global stylesheet.

    <link rel="stylesheet" href="{{ this.package.cdn.styles }}">

##### Module Import

    @use 'utilities/fonts/fonts';

Or, import from the Google Fonts CSS API directly for the customization of weights, etc. HTML `<link>` tag:

    <!-- Add the following stylesheet in the <head> of the document -->
    <link rel="stylesheet" href={{ this.tokens.googleFonts }}>

Sass import:

    // Add the following import statement in Sass file.
    @import url({{ this.tokens.googleFonts }});