// The Discovery module is designed to handle all interactions with the server

var Discovery = (function() {
    var requestPayload;
    var responsePayload;
    var messageEndpoint = '/api/discovery';

  // Publicly accessible methods defined
    return {
        sendRequest: sendRequest,

    // The request/response getters/setters are defined here to prevent internal methods
    // from calling the methods without any of the callbacks that are added elsewhere.
        getRequestPayload: function() {
            return requestPayload;
        },
        setRequestPayload: function(newPayloadStr) {
            requestPayload = JSON.parse(newPayloadStr);
        },
        getResponsePayload: function() {
            return responsePayload;
        },
        setResponsePayload: function(newPayloadStr) {
            responsePayload = JSON.parse(newPayloadStr);
        }
    };

  // Send a message request to the server
    function sendRequest(text, context) {
      console.log("Entered Discovery");
    // Build request payload
        var payloadToDiscovery = {};
        if (text) {
            payloadToDiscovery.input = {
                text: text
            };
        }
        if (context) {
            payloadToDiscovery.context = context;
        }

    // Build http request
        var http = new XMLHttpRequest();
        http.open('POST', messageEndpoint, true);
        http.setRequestHeader('Content-type', 'application/json');
        http.onreadystatechange = function() {
            if (http.readyState === 4 && http.status === 200 && http.responseText) {
                console.log("Response aaya "+http.responseText);
                var discoveryToConversation = JSON.parse(http.responseText);
                console.log(discoveryToConversation);
                var discoveryJSONified = {};
                discoveryJSONified.output={
                  text : '<a href="'+discoveryToConversation.results[0].url+'">'+discoveryToConversation.results[0].enrichedTitle.text+'</a>'
                };
                discoveryJSONified.context=Api.getResponsePayload().context;
                discoveryJSONified.context={
                  discovery : "false"
};
                Api.setResponsePayload(JSON.stringify(discoveryJSONified));
            }
        };
        var params = JSON.stringify(payloadToDiscovery);
    // Stored in variable (publicly visible through Api.getRequestPayload)
    // to be used throughout the application
        if (Object.getOwnPropertyNames(payloadToDiscovery).length !== 0) {
            console.log("Setting Request Params")
            Discovery.setRequestPayload(params);
        }
      console.log("The params are"+ params);
    // Send request
        http.send(params);
    }
}());
