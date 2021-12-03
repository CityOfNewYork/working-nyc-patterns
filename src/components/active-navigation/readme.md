<!-- Headers start with h5 ##### -->

##### Global Script

To use the Jump-nav in the global script use the following script tags:

    <script src="{{ this.package.cdn.scripts }}"></script>

    <script>
      var patterns = new {{ this.package.instantiations.scripts }}();

      var jump-nav = patterns.jump-nav();
    </script>

##### Module Import

To import the module in another script use the following statement:

    import Jump-nav from 'src/components/jump-nav/jump-nav';

    new Jump-nav();

##### Configuration

Customizable properties for the Jump-nav components.

Property | Description
---------|-
`prop`   | A description of the property.
`prop`   | A description of the property.

##### Polyfills

Describe any required polyfills.
