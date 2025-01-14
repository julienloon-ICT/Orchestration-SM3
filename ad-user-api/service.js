var Service = require('node-windows').Service;



// Create a new service object

var svc = new Service({

  name:'API - AD / vSphere',

  description: 'API for AD / vSphere connection',

  script: 'C:\\API\\ad-user-api\\server.js'

});



// Listen for the "install" event, which indicates the

// process is available as a service.

svc.on('install',function(){

  svc.start();

});



svc.install();

