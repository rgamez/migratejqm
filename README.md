# MigrateJQM

Node script to migrate jquery-mobile from 1.3.2 to jquery 1.4

## Install
### Dependencies

    npm install cheerio underscore

## Run

Warning: The script will overwrite the html's with the changes

    node migratejqm.js path/to/htmls



## Notes



### Limitations

Currently only migrate the html following the upgrade guide

http://jquerymobile.com/upgrade-guide/1.4/

### Known bugs


* If the template tags are placed inside of a tag element the html parser try to fix the content losing completely the content.