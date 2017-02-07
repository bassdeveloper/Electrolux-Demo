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

// Strict mode enabled.
'use strict';

// Using Express App Framework
var express = require('express'); // app server

// body-parser extracts the entire body portion of an incoming request stream and exposes it on `req.body` as something easier to interface with. It makes it easier to deal with request streams
var bodyParser = require('body-parser'); // parser for post requests

// Watson SDK v2
//var watson = require('watson-developer-cloud');

var ConversationV1 = require('watson-developer-cloud/conversation/v1'); // watson sdk

// Create the Conversation service wrapper
var conversation = new ConversationV1({
  // If unspecified here, the CONVERSATION_USERNAME and CONVERSATION_PASSWORD env properties will be checked
  // After that, the SDK will fall back to the bluemix-provided VCAP_SERVICES environment property
  // username: '<username>',
  // password: '<password>',
    //url: 'https://gateway.watsonplatform.net/conversation/api', //url for Conversations latest, from Watson-Developer-Cloud-V2

// Outdated params :
  // version: 'v1'
  // version_date: '2016-10-21', // outdated version date.

    version_date: ConversationV1.VERSION_DATE_2016_09_20, // according to commit by `nfriendly`. Supported version dates.

});

var queryBuilder = require('./querybuilder');
//Create the Discovery service wrapper
var DiscoveryV1 = require('watson-developer-cloud/discovery/v1');

var discovery = new DiscoveryV1({
  // If unspecified here, the DISCOVERY_USERNAME and
  // DISCOVERY_PASSWORD env properties will be checked
  // After that, the SDK will fall back to the bluemix-provided VCAP_SERVICES environment property
  // username: '<username>',
  // password: '<password>',
  version_date: '2016-11-09',
  path: {
    environment_id: process.env.ENVIRONMENT_ID || '<environment-id>',
    collection_id: process.env.COLLECTION_ID || '<collection-id>',
  },
  qs: {
    aggregation: `[${queryBuilder.aggregations.join(',')}]`
  },
});


// Initializing app with Express
var app = express();

// **Bootstrap application settings**

// express.static() - This is the only built-in middleware function in Express. It serves static files and is based on `serve-static`. It works by combining `req.url` with the provided `root` directory.
app.use(express.static('./public')); // load UI from public folder

// Returns a middleware that only parses `json`.
app.use(bodyParser.json());

// Route Configuration

// Endpoint to be called from the client side
app.post('/api/message', (req, res) => {
    // Check if Conversation Workspace is present or not :
    var workspace = process.env.WORKSPACE_ID || '<workspace-id>';
    if (!workspace || workspace === '<workspace-id>') {
        return res.json({
            'output': {
                'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the ' + '<a href="https://github.com/watson-developer-cloud/conversation-simple">README</a> documentation on how to set this variable. <br>' + 'Once a workspace has been defined the intents may be imported from ' + '<a href="https://github.com/watson-developer-cloud/conversation-simple/blob/master/training/car_workspace.json">here</a> in order to get a working application.'
            }
        });
    }

// Here, we design payload as a JSON object to be sent to the function conversation.message().
    var payload = {
        workspace_id: workspace,
        context: req.body.context || {},
        input: req.body.input || {}
    };

  // Send the input to the conversation service
    conversation.message(payload, (err, data) => {
        if (err) {
            return res.status(err.code || 500).json(err);
        }
        return res.json(updateMessage(payload, data));
    });
});

/**
 * Updates the response text using the intent confidence
 * @param  {Object} input The request to the Conversation service
 * @param  {Object} response The response from the Conversation service
 * @return {Object}          The response with the updated message
 */


function updateMessage(input, response) {
    var responseText = null;
    if (!response.output) {
        response.output = {};
    } else {
        return response;
    }
    if (response.intents && response.intents[0]) {
        var intent = response.intents[0];
    // Depending on the confidence of the response the app can return different messages.
    // The confidence will vary depending on how well the system is trained. The service will always try to assign
    // a class/intent to the input. If the confidence is low, then it suggests the service is unsure of the
    // user's intent . In these cases it is usually best to return a disambiguation message
    // ('I did not understand your intent, please rephrase your question', etc..)
        if (intent.confidence >= 0.75) {
            responseText = 'I understood your intent was ' + intent.intent;
        } else if (intent.confidence >= 0.5) {
            responseText = 'I think your intent was ' + intent.intent;
        } else {
            responseText = 'I did not understand your intent';
        }
    }
    response.output.text = responseText;
    return response;
}

app.post('/api/discovery', (req,res)=>{
  console.log("In route discovery");
  const params = queryBuilder.build(req.body.input.text);
  console.log(params);
  discovery.query(params, (error, response) => {
     if (error) {
       console.log('Error in Discovery');
       next(error);
     } else {
       console.log(JSON.stringify(response));
       res.json(response);
     }
   });
 });



// (err, data) => {
//       if (err) {
//           return res.status(err.code || 500).json(err);
//       }
//       return res.json(updateMessage(params, data));
//   });
// });
//
//  (error, response) => {
//     if (error) {
//       console.log('Error in Discovery');
//       next(error);
//     } else {
//       console.log(JSON.stringify(response));
//       res.json(response);
//     }
//   });
// });

// Make `app` as a module.
module.exports = app;
