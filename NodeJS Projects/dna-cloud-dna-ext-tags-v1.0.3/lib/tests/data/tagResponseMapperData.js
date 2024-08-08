'use strict';

var data,
    data2,
    expectedResult,
    expectedResult2,
    paths;

data = {
    "_id": "55643a966c8481f22b844bf1",
    "path": "55643a966c8481f22b844bf1",
    "tagTypeId": "SKL",
    "tagLabel": "First",
    "tagId": "SKQ_a",
    "additionalInformation": {
        "additionalFields": {
            "dsa": 1
        },
        "ewq": "rew"
    },
    "isDeprecated": false,
    "children": [
        {
            "_id": "55643aa16c8481f22b844bf3",
            "path": "55643a966c8481f22b844bf1#55643aa16c8481f22b844bf3",
            "parent": "55643a966c8481f22b844bf1",
            "tagTypeId": "SKL",
            "tagLabel": "Second",
            "tagId": "SKQ_b",
            "additionalInformation": {
                "ewq": "rew",
                "additionalFields": {
                    "dsa": 1
                },
                "parentTagId": "SKQ_a"
            },
            "isDeprecated": false,
            "children": [
                {
                    "_id": "55643ac56c8481f22b844bf5",
                    "path": "55643a966c8481f22b844bf1#55643aa16c8481f22b844bf3#55643ac56c8481f22b844bf5",
                    "parent": "55643aa16c8481f22b844bf3",
                    "tagTypeId": "SKL",
                    "tagLabel": "Third",
                    "tagId": "SKQ_c",
                    "additionalInformation": {
                        "ewq": "rew",
                        "additionalFields": {
                            "dsa": 1
                        },
                        "parentTagId": "SKQ_b"
                    },
                    "isDeprecated": false,
                    "children": [ ]
                }
            ]
        }
    ]
};

data2 = [
    [
        {
            "_id": "55643a966c8481f22b844bf1",
            "path": "55643a966c8481f22b844bf1",
            "tagTypeId": "SKL",
            "tagLabel": "First",
            "tagId": "SKQ_a",
            "additionalInformation": {
                "additionalFields": {
                    "dsa": 1
                },
                "ewq": "rew"
            },
            "isDeprecated": false
        },
        [ ]
    ],
    [
        {
            "_id": "55643aa16c8481f22b844bf3",
            "path": "55643a966c8481f22b844bf1#55643aa16c8481f22b844bf3",
            "parent": "55643a966c8481f22b844bf1",
            "tagTypeId": "SKL",
            "tagLabel": "Second",
            "tagId": "SKQ_b",
            "additionalInformation": {
                "parentTagId": "SKQ_a",
                "additionalFields": {
                    "dsa": 1
                },
                "ewq": "rew"
            },
            "isDeprecated": false
        },
        [
            {
                "tagId": "SKQ_a"
            }
        ]
    ],
    [
        {
            "_id": "55643ac56c8481f22b844bf5",
            "path": "55643a966c8481f22b844bf1#55643aa16c8481f22b844bf3#55643ac56c8481f22b844bf5",
            "parent": "55643aa16c8481f22b844bf3",
            "tagTypeId": "SKL",
            "tagLabel": "Third",
            "tagId": "SKQ_c",
            "additionalInformation": {
                "parentTagId": "SKQ_b",
                "additionalFields": {
                    "dsa": 1
                },
                "ewq": "rew"
            },
            "isDeprecated": false
        },
        [
            {
                "tagId": "SKQ_a"
            },
            {
                "tagId": "SKQ_b"
            }
        ]
    ]
];

expectedResult = {
    "tagTypeId": "SKL",
    "tagLabel": "First",
    "tagId": "SKQ_a",
    "isDeprecated": false,
    "children": [
        {
            "tagTypeId": "SKL",
            "tagLabel": "Second",
            "tagId": "SKQ_b",
            "isDeprecated": false,
            "children": [
                {
                    "tagTypeId": "SKL",
                    "tagLabel": "Third",
                    "tagId": "SKQ_c",
                    "isDeprecated": false,
                    "children": [ ]
                }
            ]
        }
    ]
};

expectedResult2 = [
    {
        "tagId": "SKQ_a",
        "tagLabel": "First",
        "isDeprecated": false,
        "tagTypeId": "SKL",
        "tagParents": [ ]
    },
    {
        "tagId": "SKQ_b",
        "tagLabel": "Second",
        "isDeprecated": false,
        "tagTypeId": "SKL",
        "tagParents": [
            "SKQ_a"
        ]
    },
    {
        "tagId": "SKQ_c",
        "tagLabel": "Third",
        "isDeprecated": false,
        "tagTypeId": "SKL",
        "tagParents": [
            "SKQ_a",
            "SKQ_b"
        ]
    }
];

paths = {
    tagId: {},
    tagLabel: {},
    isDeprecated: {},
    tagTypeId: {},
    additionalInformation: {},
    _id: {},
    parent: {},
    path: {}
};

module.exports = {
    data: data,
    data2: data2,
    expectedResult: expectedResult,
    expectedResult2: expectedResult2,
    paths: paths
};
