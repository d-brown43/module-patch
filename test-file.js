const internalFunction = () => {
    return 'internalFunction';
};

let internalLetFunction = () => {
    return 'internalLetFunction';
};

function otherInternalFunction() {
    return 'otherInternalFunction';
}

const somethingWeird = (() => {
    return () => 'somethingWeird';
})();

let somethingElse = internalFunction;

exports.externalFunction = () => {
    return 'externalFunction';
};

(() => {
    exports.anotherHiddenValue = '10';
})();

var test = exports.anotherHiddenValue;
