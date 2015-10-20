function NoErrorPromisifier(originalMethod) {
    return function promisified() {
        var args = [].slice.call(arguments);
        var self = this;
        return new Promise(function(resolve) {
            args.push(resolve);
            originalMethod.apply(self, args);
        });
    };
}

module.exports = NoErrorPromisifier;