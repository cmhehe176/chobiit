# Overview

API is not provided.
Use the browser's Devtool to manipulate the DOM while checking the DOM selector.

# Samples ( with jQuery)

 **NOTE: Some fields do not work in the sample.** 
 **In that case, please check the DOM and implement a new one.** 

## basic usage
```JavaScript
$(document).ready(function () {
    const dom = $('#iframe').contents()
    const textFieldDom = dom.find(#${fieldCode})
    // ......
})
```

## actions

### get field value (single_text_line)
```JavaScript
$('#iframe').contents().find('#${fieldCode}').val()
```

### get field value (file)
```JavaScript
$('#iframe').contents().find('.field-${fieldCode}').find('.delete-file')
```

### get field value (checkbox)
```JavaScript
$('#iframe').contents().find('input[name="${fieldCode}"]').is(':checked')
```

### disabled field
```JavaScript
$('#iframe').contents().find('#${fieldCode}').prop('disabled', true);
```

### clear checkboxes
```JavaScript
$('#iframe').contents().find('input[data-code="${fieldCode}"]').prop('checked', false);
```

## events

### on click submit button
```JavaScript
$('#submitBtn').off('click');
$('#submitBtn').click(function () {

    // some processes...

    // Finally, call the built-in save process
    // Note that if you call in more than one place for one kintone app, a record will be registered for that.
    window.submitHanlder();  //not typo :)
})
```

### open add page
```JavaScript
function isAddPage() {
    return window.location.href.indexOf('add_record.html') !== -1;
}
```

### open detail or edit page
```JavaScript
function isDetailPage() {
    return window.location.href.indexOf('detail_record.html') !== -1;
}
```

#### Be careful.....
Customizations applied to the edit screen may cause unexpected behavior in the detail screen.
If you implement a customization on the edit screen, you should also test that it does not affect the detail screen.

### catch field change
```JavaScript
$('#iframe').contents().find('#フィールドコード').change(function () {
    // some processes...
})
```