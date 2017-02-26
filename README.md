# DynamicForms

DynamicForms is an enterprise solution for small companies, a generic mobile application that can be plenty configured with forms and fulfilled with answers. Small companies can use this project in order to build tools such as:

* Send alerts for issues (to the IT team, for example)
* Make inventory of stock with the phone
* Set order deliveries
* Make project management

The application implements three groups of users:
* Employee
* Manager
* President

They all can answer the forms through the mobile app but:
* Managers can configure the forms shown within the application
* Presidents can configure the forms and also the users.

The forms can be composed with the next inputs
* Integers
* Floating point numbers
* Short strings
* Text (large strings)
* QR Codes
* Dates
* Blob values
  * Images and photos
  * Editable images and photos
* Location (mobile's GPS)
* Options

## Parts

* [API](https://github.com/cnexans/DynamicForms--API)
* [Application](https://github.com/cnexans/DynamicForms--App)
* [Dashboard](https://github.com/cnexans/DynamicForms--Dashboard)

## Application

Built with Ionic and tested for iOS and Android it is composed by:

* Services
  * Auth service
  * Connection service
  * [DynamicForms API](https://github.com/cnexans/DynamicForms--API) service
* Directives
  * General field directive
  * Current location
  * QR Code scanner
  * Signed photo
  * Camera directive
* Controllers
  * Answer (when the user answers a form)
  * Answered (when the user see an old answer)
  * Home
  * Login
