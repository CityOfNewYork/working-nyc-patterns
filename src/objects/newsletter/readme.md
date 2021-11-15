<!-- Headers start with h5 ##### -->

##### Global Script

While the Newsletter Object doesn't require JavaScript, it is needed for submitting the form without leaving the page and for front-end validation.


```html
<script src="{{ this.package.cdn.scripts }}"></script>

<script>
  var patterns = new {{ this.package.instantiations.scripts }}();
  patterns.newsletter('/path/to/full/form');
  patterns.newsletterForm();
</script>
```

`patterns.newsletter('/path/to/full/form')` instantiates the default Newsletter form field. It will pass the data from the MailChimp subscription response as URL parameters to a specified endpoint set as the first (and only) argument.

`patterns.newsletterForm()` instantiates the Full Newsletter form field. It will automatically handle the response passed as URL parameters from the single form field and display the response for the submission.

**Note**. It is recommended that data passed via URL parameters be validated.

##### Module Import

The Newsletter source exists in the [NYCO Patterns Framework](https://github.com/CityOfNewYork/nyco-patterns-framework). Install the `@nycopportunity/patterns-framework` module to import the module. Pass a selected newsletter element that contains the form to the instantiated object and set the parent selector for input validation messaging.

```javascript
import Newsletter from '@nycopportunity/patterns-framework/src/utilities/newsletter/newsletter';

let element = document.querySelector('[data-js="newsletter-form"]');

let newsletter = new Newsletter(element);

newsletter.form.selectors.ERROR_MESSAGE_PARENT = '.c-question__container';
```

###### Setting a custom callback

The `patterns.newsletter()` method uses a custom callback to the window that the MailChimp subscription endpoint sends response data to. Below is an example of this.

```javascript
// ...

let newsletter = new Newsletter(element);

// ...

// Use the instantiated Newsletter's unique callback key
window[newsletter.callback] = data => {
  data.response = true;

  // Set email to the data so it is passed along
  data.email = element.querySelector('input[name="EMAIL"]').value;

  // Set the window location to redirect to the form with URL parameters from the response
  window.location = '/path/to/full/form?' + Object.keys(data)
    .map(k => `${k}=${encodeURI(data[k])}`).join('&');
};
```

###### Pre-populating a response

The `patterns.newsletterForm()` Below is an example the global script uses to prepopulate the Newsletter response in the full form using URL parameters.

```javascript
// ...

let newsletter = new Newsletter(element);

// ...

let params = new URLSearchParams(window.location.search);
let email = params.get('email');
let input = element.querySelector('input[name="EMAIL"]');

// Populate the email field on the form
input.value = email;

// Set the instantiated Newsletter's data store
newsletter._data = {
  result: params.get('result'),
  msg: params.get('msg'),
  EMAIL: email
};

// Pass the data to the Newsletter's callback function for displaying messaging
newsletter._callback(newsletter._data);
```

View the `patterns.newsletterForm()` method source at <u>{{ this.package.src.scripts }}</u> for a full example.
