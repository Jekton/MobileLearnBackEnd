'use strict';

let mongoose = require('mongoose');
let User = mongoose.model('User');
let UserCapability = require('./server/model/capability').UserCapability;


(function() {

    let admin = new User();

    // setup your admin account
    admin.name = 'admin';
    admin.email = 'admin@localhost.com';
    admin.setPassword('964698758');

    // DON'T modify these following lines
    admin.capability = UserCapability.CAP_ADMIN;
    admin.save(function(err) {
        if (err) {
            console.error('fail to create admin account!\nError: %j',
                          err);
        } else {
            console.log('Congratulation!');
            console.log('admin account created successsfully, '
                        + 'please delete the "install.js" file');
        }
    });

    
})();
