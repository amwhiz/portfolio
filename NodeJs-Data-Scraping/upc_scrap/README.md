# UPC Code Search Application
This application is used to get input UPC code from user, search data for the code and store the result into database.

  - Enter UPC Code
  - Select No of UPC Code has been fetched from the input
  - Click Submit Button
  - View the results

### Technology used

This application uses the following technologies:

* [NodeJS](http://nodejs.org) - For Server Side 
* [Phantom JS](http://phantomjs.org) - Accessing the UPC site
* [Express JS](http://expressjs.com) - Frond End Application
* [MySQL](http://mysql.com) - Database to store the data
* [jQuery](http://jquery.com) - Client Scripting

### Installation

```sh
$ git clone [git-repo-url] abb_upc_demo
$ cd abb_upc_demo
$ npm install
$ set your configuration in both settings.js and config/env files
```

Start the server
```sh
$ node server.js
```
