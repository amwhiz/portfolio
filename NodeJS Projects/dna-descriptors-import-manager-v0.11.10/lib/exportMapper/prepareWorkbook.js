'use strict';

var uuid = require('node-uuid'),
    dnaDescriptorToXlsxRow = require('./dnaDescriptorToXlsxRow'),
    excelBuilder = require('msexcel-builder-colorfix-intfix'),
    _ = require('lodash');

function getAllHeaders(xlsxRows) {
    var allHeaders = dnaDescriptorToXlsxRow.headers;

    _.forEach(xlsxRows, function(xlsxRow) {
        [].push.apply(allHeaders, _.difference(_.keys(xlsxRow), allHeaders));
    });

    return allHeaders;
}

function getFirstLine(allHeaders) {
    var initialFirstLineKeys = dnaDescriptorToXlsxRow.firstLine;

    while (initialFirstLineKeys.length < allHeaders.length) {
        initialFirstLineKeys.push('Not required');
    }

    return initialFirstLineKeys;
}

function extendXlsxRows(xlsxRows, allHeaders) {
    _.forEach(xlsxRows, function(xlsxRow) {
        var missingKeys = _.difference(allHeaders, _.keys(xlsxRow));

        _.forEach(missingKeys, function(missingKey) {
            _.set(xlsxRow, missingKey, undefined);
        });
    });
}

function getXlsxColorObject(col) {
    var color = dnaDescriptorToXlsxRow.columnBgColors[col] || dnaDescriptorToXlsxRow.unknownColumnBgColors;

    return {
        type: 'solid',
        fgColor: color,
        bgColor: '64'
    };
}

module.exports = function prepareWorkbook(xlsxRows) {
    var filename = 'descriptors_' + uuid.v4() + '.xlsx',
        workbook = excelBuilder.createWorkbook(require('os').tmpdir(), filename),
        allHeaders = getAllHeaders(xlsxRows),
        firstLine = getFirstLine(allHeaders),
        sheet = workbook.createSheet('sheet1', firstLine.length, xlsxRows.length + 2);

    extendXlsxRows(xlsxRows, allHeaders);

    // first line
    _.forEach(firstLine, function(firstLineCellValue, idx) {
        sheet.set(1 + idx, 1, '' + firstLineCellValue);
        sheet.fill(1 + idx, 1, getXlsxColorObject(idx));
    });

    // headers
    _.forEach(allHeaders, function(header, idx) {
        sheet.set(1 + idx, 2, '' + header);
        sheet.fill(1 + idx, 2, getXlsxColorObject(idx));
    });

    // descriptors data
    _.forEach(xlsxRows, function(rowObj, rowIdx) {
        _.forEach(rowObj, function(rowCellValue, header) {
            sheet.set(1 + allHeaders.indexOf(header), rowIdx + 3, rowCellValue);
        });
    });

    return workbook;
};
