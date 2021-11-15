<!-- Headers start with h5 ##### -->

##### Global Script

The Web Share Component requires JavaScript for calling the `navigator.share()` API in supported browsers and showing/hiding the fallback for unsupported browsers. It also uses a Toggle and Copy-to-clipboard Utility for the fallback component. To use the Web Share Component through the global script use the following code:

    <script src="{{ this.package.cdn.scripts }}"></script>

    <script>
      var patterns = new {{ this.package.instantiations.scripts }}();
      patterns.webShare();
      patterns.copy();
    </script>

This will instantiate the Web Share Component and fallback component.

##### Module Import

The Web Share source exisits in the [NYCO Patterns Framework](https://github.com/CityOfNewYork/nyco-patterns-framework). Install the `@nycopportunity/patterns-framework` module to import the module. This method allows the specification of a callback method for a successful share and the fallback method. The `Toggle` and `Copy` modules are optional but required for the fallback in the demo.

    import WebShare from '@nycopportunity/patterns-framework/src/web-share/web-share';
    import Toggle from '@nycopportunity/patterns-framework/src/utilities/toggle/toggle';
    import Copy from '@nycopportunity/patterns-framework/src/utilities/copy/copy';

    new WebShare({
      callback: () => {
        // Designate a callback function for a successful share here
      },
      fallback: () => {
        new Toggle({
          selector: WebShare.selector
        });
      }
    });

    new Copy();

##### Configuration

The `WebShare()` accepts an object with the following attributes:

Attribute    | Description
-------------|-
`selector`   | An alternate selector to the default `[data-js*="web-share"]`
`callback`   | A callback function executed on a successful share.
`fallback`   | A fallback function executed when the browser does not support `navigator.share()`.

<!-- ##### Polyfills

Describe any required polyfills. -->
