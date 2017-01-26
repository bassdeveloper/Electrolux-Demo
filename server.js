#!/usr/bin/env node

/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

/**
 * Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env.
 * Storing the configuraiton in the environment separate from code
 */
require('dotenv').config({
    silent: true
});

// Server requires app.js to be executed.
var server = require('./app');

//Obtaining port for running the app
var port = process.env.PORT || process.env.VCAP_APP_PORT || 3000;

// For running the server (i.e. make it listen on a particular port.)
server.listen(port, function() {
    // eslint-disable-next-line
    console.log('Server running on port: %d', port);
});

// cc53bed5-d833-4a35-9f2f-47a7f841132c - codecov id. 
