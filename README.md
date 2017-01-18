# bf-swag

This is a self-hosted application that requires some setup to use.  To get started, you'll need to have a few things:

1. [NodeJS](http://nodejs.org) v7 installed.
2. A system running with BASH (A native shell used by Linux and OSX, windows is not supported but cygwin might work)
3. A TRN Api key, you can get one at https://battlefieldtracker.com/site-api

## Environment Variables
Instead of hard-coding any configuration, this standalone application uses environment variables.  The following are used:

<table>
<thead>
<tr><th>Key</th><th>Description</th></tr>
</thead>
<tbody>
<tr><td>TRN_API_KEY</td><td>Required API Key required to comminucate with battlefieldtracker.com</td></tr>
<tr><td>HOST</td><td>Optional domain host - falls back to IP</td></tr>
<tr><td>IP</td><td>Optional ip - falls back to 0.0.0.0</td></tr>
<tr><td>PORT</td><td>Optional port - falls back to 3000</td></tr>
<tr><td>REDIS_URL</td><td>Optional URL to your redis endpoint - if blank redis is not used</td></tr>
<tr><td>KEEN_PROJECT_ID</td><td>Optional, Keen analytics project ID - ignore if you dont want to use. </td></tr>
<tr><td>KEEN_WRITE_KEY</td><td>Optional, Keen analytics write key - ignore if you dont want to use. </td></tr>
</tbody>
</table>

## Installation

Download [NodeJS](http://nodejs.org)

Clone this project:
```
git clone https://github.com/MattMcFarland/bf-swag
```

Install Dependencies:
```
npm install
```

Start the application:
```
npm start
```

## Using production environments

It is highly recommended you use a cloud platform that takes advantage of the nodejs pipeline.  Heroku, MS Azure, Google CLoud Compute, and Amazon AWS are all viable options. I personally used Heroku for this project and found it to be the easiest.

### Usage on a (virtual or not) dedicated server

If you are planning on running this on your own managed server - some extra steps will be necessary, and the installation will be more difficult!
It might be worth it to install `pm2` http://pm2.keymetrics.io/

To run with apache, see http://stackoverflow.com/questions/9831594/apache-and-node-js-on-the-same-server

If you are running with nginx - see https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04

