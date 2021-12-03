<!-- Headers start with h5 ##### -->

##### Global Script

The Accordion Component requires JavaScript for functionality and screen reader accessibility. To use the Accordion in the global script use the following code:

    <script src="{{ this.package.cdn.scripts }}"></script>

    <script>
      var patterns = new {{ this.package.instantiations.scripts }}();
      patterns.accordion();
    </script>

This function will attach the accordion toggling event to the body of the document.

##### Module

    import Accordion from 'src/components/accordion/accordion';

    new Accordion();

##### Polyfills

This script uses the [Toggle Utility](/toggle) as a dependency and reqiures the same polyfills for IE11 support. See the ["Toggle Usage" section](/toggle#toggle-usage) for details on specific methods.
