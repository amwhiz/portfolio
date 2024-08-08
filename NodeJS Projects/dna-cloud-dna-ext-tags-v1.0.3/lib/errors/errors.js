'use strict';

module.exports = {
    DuplicatedTagError: require('./DuplicatedTagError'),
    DuplicatedTagTypeError: require('./DuplicatedTagTypeError'),
    MissingTagTypeError: require('./MissingTagTypeError'),
    NotEmptyTagTypeError: require('./NotEmptyTagTypeError'),
    NotUniqTagLabelError: require('./NotUniqTagLabelError'),
    MissingTagLabelError: require('./MissingTagLabelError'),
    CannotEditTagIdError: require('./CannotEditTagIdError'),
    CannotEditTagTypeIdError: require('./CannotEditTagTypeIdError'),
    MissingTagTypeLabelError: require('./MissingTagTypeLabelError'),
    CannotFindParentError: require('./CannotFindParentError'),
    CannotRemoveTagWithChildrenError: require('./CannotRemoveTagWithChildrenError')
};
