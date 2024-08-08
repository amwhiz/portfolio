'use strict';

var _ = require('lodash'),
    objectPath = require('object-path'),
    ParamsMapper,
    TagRetriever = require('./TagRetriever'),
    definedFieldsMap = require('./definedFieldsMap');

ParamsMapper = function(params) {
    if (params) {
        this.init(params);
    }
};

ParamsMapper.prototype.init = function(params) {
    this.params = params || {};
    this.tagTypes = _.get(this.params, 'tagTypes.tags', {});
    this.descriptor = _.get(this.params, 'descriptor', {});
    this.syllabuses = _.get(this.params, 'syllabuses.data', {});
    this.descriptorStatuses = _.get(this.params, 'descriptorStatuses.data');

    this.descriptorAccessor = function(field) {
        return objectPath.get(this.descriptor, field);
    };

    this.usedDescriptorFields = {};
    this.syllabusByName = _.indexBy(this.syllabuses, 'syllabusName');
    this.descriptorStatusByLabel = _.indexBy(this.descriptorStatuses, 'description');
    this.tagRetriever = new TagRetriever(this.descriptor, this.tagTypes, this.params.errorLog);
};

/**
 * @returns {{descriptiveId: *, descriptor: *, syllabus: *, descriptors: *, attribution: *, descriptorStatus: *, status: *, tags: *, ratingsData: *, additionalInformation: *}}
 */
ParamsMapper.prototype.retrieveDescriptor = function() {
    return {
        descriptiveId: this.getDescriptiveId(),
        descriptor: this.getDescriptor(),
        syllabuses: this.getSyllabus(),
        descriptors: this.getDescriptors(),
        attribution: this.getAttribution(),
        descriptorStatus: this.getDescriptorStatus(),
        status: this.getStatus(),
        tags: this.getTags(),
        additionalInformation: this.getAdditionalInformation() // additional information must be retrieved last
    };
};

// simple fields
ParamsMapper.prototype.getDescriptiveId = function() {
    return this.useDescriptorField(definedFieldsMap.descriptiveId);
};

ParamsMapper.prototype.getDescriptor = function() {
    return this.useDescriptorField(definedFieldsMap.descriptor);
};

ParamsMapper.prototype.getAttribution = function() {
    return this.useDescriptorField(definedFieldsMap.attribution);
};

ParamsMapper.prototype.getDescriptorStatus = function() {
    return this.translateDescriptorsStatusXlsxLabelToDnaKey(this.useDescriptorField(definedFieldsMap.descriptorStatus));
};

ParamsMapper.prototype.translateDescriptorsStatusXlsxLabelToDnaKey = function(xlsxLabel) {
    var statusObj,
        dnaKey;

    statusObj = _.find(this.descriptorStatusByLabel, function(stat) {
        return (xlsxLabel + '').toLowerCase().trim() === _.get(stat, 'description', '').toLowerCase().trim();
    });

    dnaKey = _.get(statusObj, 'descriptorStatus');

    if (dnaKey) {
        return dnaKey;
    }

    throw new Error('Cannot find status ID for label "' + xlsxLabel + '"');
};

// fixed fields
ParamsMapper.prototype.getStatus = function() {
    return true; // currently all descriptors being imported are assumed to be active
};

ParamsMapper.prototype.getDescriptors = function() {
    return []; // currently related descriptors are not being imported
};

// collections
ParamsMapper.prototype.getSyllabus = function() {
    var _this = this,
        syllabusIds,
        syllabusNames = this.useDescriptorField(definedFieldsMap.syllabuses);

    syllabusNames = syllabusNames.split(/,\ ?/);

    syllabusIds = syllabusNames.reduce(function(_syllabusIds, syllabusName) {
        var id = objectPath.get(_this.syllabusByName, syllabusName + '.syllabusId');
        if (id) {
            _syllabusIds.push(id);
        }

        return _syllabusIds;
    }, []);

    return syllabusIds;
};

ParamsMapper.prototype.getTags = function() {
    var tagsMap = this.tagRetriever.getTagsToSendMap(),
        keys = _.pluck(tagsMap, 'translatedTagTypeName'),
        values = _.pluck(tagsMap, 'tagToSendMap'),
        _this = this;

    _.forEach(keys, function(key) {
        _this.markFieldAsUsed(key);
    });

    return values;
};

ParamsMapper.prototype.getAdditionalInformation = function() {
    return _.mapValues(_.omit(this.descriptor, _.keys(this.usedDescriptorFields)), function(additionalInformationValue) {
        return additionalInformationValue !== null && additionalInformationValue !== undefined ? additionalInformationValue + '' : '';
    });
};

ParamsMapper.prototype.markFieldAsUsed = function(field) {
    this.usedDescriptorFields[field] = true;
};

ParamsMapper.prototype.determineFieldName = function(fields) {
    if (!_.isArray(fields)) {
        fields = [fields];
    }

    return _.find(fields, function(field) {
        return _.has(this.descriptor, field);
    }, this);
};

ParamsMapper.prototype.useDescriptorField = function(field) {
    var _field = this.determineFieldName(field);

    this.markFieldAsUsed(_field);

    return this.descriptorAccessor(_field);
};

module.exports = ParamsMapper;
