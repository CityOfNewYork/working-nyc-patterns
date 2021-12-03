<!-- Headers start with h5 ##### -->

##### Usage

The Dropdown Component uses JavaScript for toggling and accessibility.

###### Global Script

```html
<script src="{{ this.package.cdn.scripts }}"></script>

<script>
  var patterns = new {{ this.package.instantiations.scripts }}();
  patterns.dropdown();
</script>
```

###### Module Import

```javascript
import Dropdown from 'src/components/dropdown/dropdown';

new Dropdown();
```