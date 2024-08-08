'use strict';

var DnaCloudDnaExtensionsPack = function(modules) {
    this.modules = modules;
};

DnaCloudDnaExtensionsPack.prototype.load = function() {
    var args = arguments;
    this.modules.forEach(function(module) {
        module.load.apply(module, args);
    });
};

module.exports = new DnaCloudDnaExtensionsPack([
    require('dna-cloud-dna-ext-tags'),
    require('dna-cloud-dna-ext-search')
]);
