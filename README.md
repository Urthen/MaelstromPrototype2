MaelstromPrototype2
===================

Second Maelstrom Prototype. Kickass.

Installation
------------

Prerequisites: You must have installed [node.js](http://www.nodejs.org) and [nodemon](https://github.com/remy/nodemon/) as appropriate for your platform.

1. Install [node.js](http://www.nodejs.org) as appropriate for your platform (see the site docs)
2. Install [nodemon](https://github.com/remy/nodemon/) with `npm install -g nodemon` (you may need sudo)
3. Install [grunt](https://github.com/cowboy/grunt) with `npm install -g grunt` (again, may need sudo)
4. Install [redis](http://redis.io/download). We suggest you also run the following from the directory you ran `make` from. This will allow you to run `redis-server` and `redis-cli` from anywhere. 
        ln -s src/redis-server ~/bin/redis-server
        ln -s src/redis-cli ~/bin/redis-cli
5. Clone the repository locally
6. Run `npm install -d` at a command line in the repository folder to install dependancies
7. Retrieve the .env file neccesary to run foreman from a fellow teammember

Running the app
---------------

Start up redis by running `redis-server redis.conf` in the repo directory. In another terminal window, run the Maelstrom instance itself with `foreman start -f DevProcfile`

Testing the app
---------------

Before committing, test the app by running `grunt` in the repo directory. This will run lint the javascript, test the javascript, and compile and compress the LESS into CSS for production. Correct any failures!

If you didn't change any app code, only LESS, you can just run `grunt less` to recompile and compress the LESS only.

Tips
----

Using Sublime Text? Annoyed by lack of syntax highlighting in .jade files? Install it by running this on the command line:

    cd ~/Library/Application\ Support/Sublime\ Text\ 2/Packages
    git clone https://github.com/miksago/jade-tmbundle.git Jade

Having trouble debugging? Try [node-inspector](https://github.com/dannycoates/node-inspector)
