'use strict';

var chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    mockery = require('mockery'),
    documentService,
    mongooseMock,
    multipartyMock,
    documentMock,
    fsMock,
    existsCallback;

chai.use(sinonChai);

describe('Document Service', function() {
    before(function() {
        multipartyMock = {};
        multipartyMock.Form = function() {
        };

        multipartyMock.Form.prototype.parse = function(req, cb) {
        };

        documentMock = {
            findOneAsync: function() {
                return {
                    then: function() {
                    }
                };
            },
            findAsync: function() {
            }
        };

        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false,
            useCleanCache: true
        });

        mongooseMock = {
            model: function() {
                return documentMock;
            }
        };

        fsMock = {
            exists: function(file, cb) {
                existsCallback = cb;
            },
            readFileSync: function() {
                return '';
            },
            unlink: function() {
            }
        };

        mockery.registerMock('mongoose', mongooseMock);
        mockery.registerMock('fs', fsMock);
        mockery.registerMock('multiparty', multipartyMock);

        documentService = require('../../services/document.service');
    });

    after(function() {
        mockery.disable();
    });

    describe('parseForm', function() {
        it('should exist', function() {
            expect(documentService.parseForm).to.be.an('function');
        });
    });

    describe('flatParams', function() {
        it('should exist', function() {
            expect(documentService.flatParams).to.be.an('function');
        });

        it('should flat params', function() {
            var paramsToFlat,
                expectedResult;

            paramsToFlat = {
                id: [1],
                name: ['someName']
            };

            expectedResult = {
                id: 1,
                name: 'someName'
            };

            expect(documentService.flatParams(paramsToFlat)).to.be.deep.equal(expectedResult);
        });
    });

    describe('getDocument', function() {
        it('should exist', function() {
            expect(documentService.getDocument).to.be.an('function');
        });

        it('should call findAsync document model when there is no field in query', function() {
            var findAsyncSpy = sinon.spy(documentMock, 'findAsync'),
                query,
                field = 'someField';

            query = {
                id: 'dsa'
            };

            documentService.getDocument(query, field);
            expect(findAsyncSpy).to.have.been.calledWith(query, field);
        });

        it('should call findOneAsync document model when there is field in query', function() {
            var findOneAsyncSpy = sinon.spy(documentMock, 'findOneAsync'),
                query,
                field = 'id';

            query = {
                id: 'dsa'
            };

            documentService.getDocument(query, field);
            expect(findOneAsyncSpy).to.have.been.callCount(1);
        });

        after(function() {
            documentMock.findOneAsync.restore();
            documentMock.findAsync.restore();
        });
    });

    describe('createOrUpdateDocument', function() {
        it('should exist', function() {
            expect(documentService.createOrUpdateDocument).to.be.an('function');
        });

        it('should call newDocument for no params', function() {
            var queryParams = {},
                content = '',
                contentType = 'application/json',
                findOneAsyncSpy = sinon.spy(documentMock, 'findOneAsync');

            documentService.createOrUpdateDocument(queryParams, content, contentType);
            expect(findOneAsyncSpy).to.have.been.callCount(1);
        });
    });

    describe('saveFile', function() {
        it('should exist', function() {
            expect(documentService.saveFile).to.be.an('function');
        });

        it('should return promise', function() {
            var file = {
                originalFilename: '',
                path: ''
            };

            expect(documentService.saveFile(file).constructor.name).to.be.equal('Promise');
        });
    });

    describe('removeFile', function() {
        it('should exist', function() {
            expect(documentService.removeFile).to.be.an('function');
        });

        it('should call fs.exists', function() {
            var fsExistsSpy = sinon.spy(fsMock, 'exists'),
                filePath = '';

            documentService.removeFile(filePath);
            expect(fsExistsSpy).to.have.been.callCount(1);
        });

        describe('existsCallback', function() {
            it('should call fs.unlink for true', function() {
                var fsUnlinkSpy = sinon.spy(fsMock, 'unlink');

                existsCallback(true);
                expect(fsUnlinkSpy).to.have.been.callCount(1);
            });

            after(function() {
                fsMock.exists.restore();
                fsMock.unlink.restore();
            });
        });
    });
});
