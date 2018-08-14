
configurations = {}

configurations.staging = {
    envName :  "staging",
    httpPort :  3000,
    httpsPort : 3001 
}

configurations.production = {
    envName :  "production",
    httpPort :  5000,
    httpsPort : 5001 
}

var requestedEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase(): '';
var chosenEnvironment = typeof(configurations[requestedEnvironment]) == 'object' ? configurations[requestedEnvironment] : configurations['staging'];

module.exports = chosenEnvironment;
