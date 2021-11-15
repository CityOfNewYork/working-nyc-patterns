<!-- Headers start with h5 ##### -->

##### Global Script

To use the {{ Pattern }} in the global script use the following script tags:

    <script src="{{ this.package.cdn.scripts }}"></script>

    <script>
      var patterns = new {{ this.package.instantiations.scripts }}();

      var {{ pattern }} = patterns.{{ pattern }}();
    </script>

##### Module Import

To import the module in another script use the following statement:

    import {{ Pattern }} from 'src/{{ type }}/{{ pattern }}/{{ pattern }}';

    new {{ Pattern }}();

##### Configuration

Customizable properties for the {{ Pattern }} {{ type }}.

Property | Description
---------|-
`prop`   | A description of the property.
`prop`   | A description of the property.

##### Polyfills

Describe any required polyfills.
