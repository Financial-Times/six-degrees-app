# An FT Six Degrees prototype NodeJS / FE Aurelia application.

## Overview

This project contains a prototype implementation of both back-end and front-end FT Six Degrees application based on FT FE App starterpack.

## Quickstart

The FT Six Degrees prototype build tools do not support Windows as a development environment. The instructions on this page assume you are using a UNIX-like OS. If you're a Windows user, consider running a Linux VM.

###Prerequisites

To get and build the application, it is required to have **Git** and **NodeJS** preinstalled on the target machine / environment.

* [Git](https://www.git-scm.com/) is required to fetch the startpack from the FT repository
* [NodeJS](http://nodejs.org/) is the JavaScript runtime, which is required for the back-end application as well as to run the build process and tasks runner
* [Gulp](http://gulpjs.com/) is a task runner, which is being used to run the build process
* [jspm](http://jspm.io/) is a package manager for the SystemJS universal module loader, built on top of the dynamic ES6 module loader - it is required due to the specifics of the FE app design and usage of Aurelia framework

#### Step 1

Start with installing **Git** and **NodeJS** versions that are corresponding to your OS. To make sure the tools are ready and accessible, run the following commands respectively:

    node -v

and

    git --version

which will allow you to find out which version of these you've got installed.

#### Step 2

Providing that you've got the **NodeJS** on your machine, you can install **Gulp** and **jspm** globally by simply typing:

    npm install gulp -g

and

    npm install jspm -g

Please note that you'll need administrative access to your machine to complete this step, as it installs both tools globally, so they can be used from any place in the OS folder's structure.

#### Step 3

Once you've got all the above preinstalled, you're ready to fetch the starter pack project from the repository:

    git clone https://github.com/tomaszlibich/ft-api-six-degrees YOUR_PROJECT_FOLDER

#### Step 4

With the starter pack downloaded, navigate to the root folder of the project and type:

    npm install

This will install all the required dependencies for you.

#### Step 5

You're ready to run the application! Simply type:

    npm run release

in the terminal at the root folder and it will build the app for you in a minified, concatenated, UAT / Prod version. Once the build process is finished, go to your browser and navigate to

    localhost:8080

to see the app working.