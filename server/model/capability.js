'use strict';

module.exports.UserCapability = {
    // prevent unintentional modification
    get CAP_ADMIN() {
        return 1;
    },
    get CAP_CREATE_COURSE() {
        return 2;
    },
    get CAP_UPLOAD_LECTURE() {
        return 4;
    },
    get CAP_UPLOAD_FILE() {
        return 8;
    },
    get CAP_ADD_REVIEW() {
        return 16;
    },

    get NR_MAX_CAP() {
        // a user can set multi-capability by bit-wise or several caps
        return 32;
    }
};


module.exports.isUserCapabilityValid = function(cap) {
    return cap < exports.UserCapability.NR_MAX_CAP;
};
