'use strict';

var objectPath = require('object-path'),
    _ = require('lodash'),
    firstLineValues = ['CORE', 'Additional tag'],
    columnColors = ['92d050', 'ffff00'],
    unknownColumnBgColors = 'bfbfbf',
    firstLineMatrix = [0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
    TAG_SEPARATOR = '|';

function DnaDescriptorToXlsxRow() {
    var _this = this;

    Object.defineProperty(this, 'retrievers', {
        get: function() {
            return {
                'Descriptive ID': _this.getDescriptiveId,
                'Draft IDs': _this.getDraftIds,
                Status: _this.getStatus,
                Syllabus: _this.getSyllabus,
                Batch: _this.getBatch,
                Attribution: _this.getAttribution,
                Skill: _this.getSkill,
                'GSE Value': _this.getGSEValue,
                'GSE Band': _this.getGSEBand,
                'CEFR Level': _this.getCEFRLevel,
                Source: _this.getSource,
                Descriptor: _this.getDescriptor,
                'Function/Notion': _this.getFunctionNotion,
                Example: _this.getExample,
                Anchor: _this.getAnchor,
                'Estimated Level': _this.getEstimatedLevel,
                'Source Descriptor': _this.getSourceDescriptor,
                'CEFR Communicative activity': _this.getCEFRCommunicativeActivity,
                'N2000 Logit': _this.getN2000Logit
            };
        }
    });

    Object.defineProperty(this, 'headers', {
        get: function() {
            return Object.keys(_this.retrievers);
        }
    });
}

DnaDescriptorToXlsxRow.prototype.findTagValue = function(descriptor, dnaTagTypeName) {
    if (!_.isArray(dnaTagTypeName)) {
        dnaTagTypeName = [dnaTagTypeName];
    }

    var tagTypeObj = _.find(descriptor.tags.concat(descriptor.gse), function(tagType) {
        return _.contains(dnaTagTypeName, objectPath.get(tagType, 'tagTypeName'));
    });

    return _.pluck(objectPath.get(tagTypeObj || {}, 'tags', []), 'tagName').join(TAG_SEPARATOR);
};

DnaDescriptorToXlsxRow.prototype.getAdditionalInformationField = function(descriptor, possibleNames) {
    return objectPath.coalesce(objectPath.get(descriptor, 'additionalInformation'), possibleNames);
};

DnaDescriptorToXlsxRow.prototype.knownAdditionalFields = {
    draftIds: ['Draft IDs', 'draftIds'],
    batch: ['Batch', 'batch'],
    source: ['Source', 'source'],
    functionNotion: ['Function/Notion', 'functionNotion', 'FunctionNotion'],
    example: ['Example', 'example'],
    anchor: ['Anchor', 'anchor'],
    estimatedLevel: ['Estimated Level', 'estimatedLevel'],
    sourceDescriptor: ['Source Descriptor', 'sourceDescriptor'],
    CEFRCommunicativeActivity: ['CEFR Communicative activity', 'CEFRCommunicativeActivity'],

    //jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    n2000_logit: ['N2000 Logit', 'n2000_logit']

    //jscs:enable requireCamelCaseOrUpperCaseIdentifiers
};

DnaDescriptorToXlsxRow.prototype.getDraftIds = function(descriptor) {
    return this.getAdditionalInformationField(descriptor, this.knownAdditionalFields.draftIds);
};

DnaDescriptorToXlsxRow.prototype.getBatch = function(descriptor) {
    return this.getAdditionalInformationField(descriptor, this.knownAdditionalFields.batch);
};

DnaDescriptorToXlsxRow.prototype.getSource = function(descriptor) {
    return this.getAdditionalInformationField(descriptor, this.knownAdditionalFields.source);
};

DnaDescriptorToXlsxRow.prototype.getFunctionNotion = function(descriptor) {
    return this.getAdditionalInformationField(descriptor, this.knownAdditionalFields.functionNotion);
};

DnaDescriptorToXlsxRow.prototype.getExample = function(descriptor) {
    return this.getAdditionalInformationField(descriptor, this.knownAdditionalFields.example);
};

DnaDescriptorToXlsxRow.prototype.getAnchor = function(descriptor) {
    return this.getAdditionalInformationField(descriptor, this.knownAdditionalFields.anchor);
};

DnaDescriptorToXlsxRow.prototype.getEstimatedLevel = function(descriptor) {
    return this.getAdditionalInformationField(descriptor, this.knownAdditionalFields.estimatedLevel);
};

DnaDescriptorToXlsxRow.prototype.getSourceDescriptor = function(descriptor) {
    return this.getAdditionalInformationField(descriptor, this.knownAdditionalFields.sourceDescriptor);
};

DnaDescriptorToXlsxRow.prototype.getCEFRCommunicativeActivity = function(descriptor) {
    return this.getAdditionalInformationField(descriptor, this.knownAdditionalFields.CEFRCommunicativeActivity);
};

DnaDescriptorToXlsxRow.prototype.getN2000Logit = function(descriptor) {
    //jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    return this.getAdditionalInformationField(descriptor, this.knownAdditionalFields.n2000_logit);

    //jscs:enable requireCamelCaseOrUpperCaseIdentifiers
};

DnaDescriptorToXlsxRow.prototype.getDescriptiveId = function(descriptor) {
    return descriptor.descriptiveId;
};

DnaDescriptorToXlsxRow.prototype.getStatus = function(descriptor, tags, syllabuses, descriptorStatuses) {
    var statusKey = objectPath.get(descriptor, 'descriptorStatus'),
        descriptorStatusObj;

    descriptorStatusObj = _.find(descriptorStatuses.data, function(descriptorStatus) {
        return descriptorStatus.descriptorStatus === statusKey;
    });

    return objectPath.get(descriptorStatusObj, 'description');
};

DnaDescriptorToXlsxRow.prototype.getSyllabus = function(descriptor) {
    return _.pluck(descriptor.syllabuses, 'syllabusName').join(', ');
};

DnaDescriptorToXlsxRow.prototype.getAttribution = function(descriptor) {
    return descriptor.attribution;
};

DnaDescriptorToXlsxRow.prototype.getSkill = function(descriptor) {
    return this.findTagValue(descriptor, 'Skill');
};

DnaDescriptorToXlsxRow.prototype.getGSEValue = function(descriptor) {
    return this.findTagValue(descriptor, ['GSE Value']);
};

DnaDescriptorToXlsxRow.prototype.getGSEBand = function(descriptor) {
    return this.findTagValue(descriptor, ['GSE Band']);
};

DnaDescriptorToXlsxRow.prototype.getCEFRLevel = function(descriptor) {
    return this.findTagValue(descriptor, 'CEFR');
};

DnaDescriptorToXlsxRow.prototype.getDescriptor = function(descriptor) {
    return descriptor.descriptor;
};

DnaDescriptorToXlsxRow.prototype.firstLine = firstLineMatrix.map(function(num) {
    return firstLineValues[num];
});

DnaDescriptorToXlsxRow.prototype.columnBgColors = firstLineMatrix.map(function(num) {
    return columnColors[num];
});

DnaDescriptorToXlsxRow.prototype.unknownColumnBgColors = unknownColumnBgColors;

DnaDescriptorToXlsxRow.prototype.setUnknownAdditionalInformationFieldIfNeeded = function(xlsxRow, unknownKey, descriptor) {
    if (!_.has(xlsxRow, unknownKey)) {
        _.set(xlsxRow, unknownKey, this.getAdditionalInformationField(descriptor, [unknownKey]));
    }
};

DnaDescriptorToXlsxRow.prototype.retrieveXlsxRow = function(descriptor, tags, syllabuses, descriptorStatuses) {
    var xlsxRow,
        allKeys,
        knownKeys,
        unknownKeys;

    xlsxRow = _.mapValues(this.retrievers, function(retriever) {
        return retriever.call(this, descriptor, tags, syllabuses, descriptorStatuses);
    }, this);

    allKeys = _.keys(objectPath.get(descriptor, 'additionalInformation'));
    knownKeys = _.keys(this.knownAdditionalFields);
    unknownKeys = _.difference(allKeys, knownKeys);

    _.forEach(unknownKeys, function(unknownKey) {
        this.setUnknownAdditionalInformationFieldIfNeeded(xlsxRow, unknownKey, descriptor);
    }, this);

    return xlsxRow;
};

module.exports = new DnaDescriptorToXlsxRow();
