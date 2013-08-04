Exercise.Node.Js
================

A collection of simple Node.js apps for demonstration &amp; educational purposes. All of these samples work good in Linux.

Things to do before running the sample:
=======================================

Ensure that you have installed Node.js in your machine. Also, installing Node.js's Hotnode package (run 'npm install hotnode' command ) could save your time from stop-restarting Node.js server when you change your code.

Some of the samples use Jasmine-Node as their unit testing framework (e.g. Demo.Node.RestServer). You need to install jasmine-node npm as well if you wish to run their unit tests.

HOW TO - Pull the project from github to your local machine:
============================================================
1. Open your terminal box ( press CTL+ALT+T if you are in GUI mode ).
2. Change directory to a folder where you are going to put the source code in.
3. Type & run this command: git clone https://github.com/saintc0d3r/Exercise.Node.Js.git

HOW TO - Run the samples:
=========================
1. In the terminal box, change directory to the sample folder (e.g. cd Projects/web/Exercise.Node.Js/Demo.HttpServer).
2. Type & run this command against the Node's javascript file in the sample demo. (e.g. hotnode exercise_http_server.js).
3. Open your browser then browse to this URL: http://localhost:8080

Sample Projects:
================
1. Demo.HttpServer - A simple demo about creating a web server, using Node's http class which has page caching, page streaming & whitelisting features. 

2. Demo.Node.RestServer - A simple REST server implemented using Node.js which does data CRUD operation on Redis NoSQL databse. To run this sample, you need to install & run Redis server and these following NPMs: Barista router (https://github.com/kieran/barista),  jasmine-node (https://github.com/mhevery/jasmine-node) & node-redis (https://github.com/mranney/node_redis).

Future TODOs:
=============
Add more samples which integrate Node.js with cool front end stuffs ( angular.js + bootstrap ), touching NoSQL Storage ( i prefer Redis) & deployment to various Cloud providers.
