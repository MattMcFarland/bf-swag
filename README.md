# bf-swag

This is a self-hosted application that requires some setup to use.  To get started, you'll need to have a few things:

1. A redis server - set one up in minutes at heroku
2. A keen io account - set up a free one in minutes at heroku
3. A TRN api key - set up one in seconds at battlefieldtracker.com

Then you'll need to set the following environment variables:

* REDIS_URL
* TRN_API_KEY
* PORT
* IP or HOST
* KEEN_PROJECT_ID
* KEEN_WRITE_KEY

If any are not set this will not run.  If you would like to forego using keen or redis, you can do so by modifying the source code.  Right now I have no interest in doing so as while this is an open source project it is setup to run on a specific site and these things are required!  If there is enough interest to separate these I may consider :)  The main goal of showing this in opensource is for educational purposes. :D
