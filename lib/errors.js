var colors = require('colors');
var FS = require('fs');

/**
 * Set of errors for specified file.
 *
 * @name Errors
 */
var Errors = function() {
    this._errorList = [];
};

/**
 * @enum
 * @type {String}
 */
Errors.TYPE = {
    'INVALID_TYPE': 'INVALID_TYPE',
    'INVALID_VAR_TYPE': 'INVALID_VAR_TYPE',
    'STRING_HAS_TAGS': 'STRING_HAS_TAGS',
    'UNKNOWN': 'UNKNOWN'
};

Errors.prototype = {
    /**
     * Adds style error to the list
     *
     * @param {Errors.TYPE} errorType
     * @param {Object} error
     * @param {Object} where
     */
    add: function(errorType, error, where) {
        this._errorList.push({
            type: errorType,
            error: error,
            where: where
        });
    },

    /**
     * Returns style error list.
     *
     * @returns {Object[]}
     */
    getErrorList: function() {
        return this._errorList;
    },

    /**
     * Returns true if no errors are added.
     *
     * @returns {Boolean}
     */
    isEmpty: function() {
        return this._errorList.length === 0;
    },

    /**
     * Returns amount of errors added by the rules.
     *
     * @returns {Number}
     */
    getErrorCount: function() {
        return this._errorList.length;
    },

    /**
     * Formats error for further output.
     *
     * @param {Object} error
     * @param {Boolean} colorize
     * @returns {String}
     */
    explainError: function(error, colorize) {
        var where = error.where;
        var lines = FS.readFileSync(where.filename, 'utf-8').split('\n');

        var lineNumber = where.line + 1;
        var result = [
            renderLine(lineNumber, lines[lineNumber], colorize),
            renderPointer(where.column, colorize)
        ];
        var i = lineNumber - 1;
        var linesAround = 2;
        while (i >= 0 && i >= (lineNumber - linesAround)) {
            result.unshift(renderLine(i, lines[i], colorize));
            i--;
        }
        i = lineNumber + 1;
        while (i < lines.length && i <= (lineNumber + linesAround)) {
            result.push(renderLine(i, lines[i], colorize));
            i++;
        }
        result.unshift(formatErrorMessage(error, colorize));
        return result.join('\n');
    },

    /**
     * Formats all errors for further output.
     */
    explainErrors: function() {
        var errors = this.getErrorList();
        errors.forEach(function(error) {
            console.log(this.explainError(error, true) + '\n');
        }, this);

        if (errors.length) {
            /**
             * Printing summary.
             */
            console.log('\n' + errors.length + ' ' + (errors.length === 1 ? 'error' : 'errors') + ' found.');
            process.exit(1);
        }
    }

};

/**
 * Formats error message header.
 *
 * @param {Object} error
 * @param {Boolean} colorize
 * @returns {String}
 */
function formatErrorMessage(error, colorize) {
    var msg = error.error;
    var where = error.where;
    return (colorize ? colors.bold(error.type) : error) +
        ' at ' +
        (colorize ? colors.green(where.filename) : where.filename) + ' :\n' +
        colors.bold(
            printTypedError(error.type, msg) +
            '. Property MUST be "xml" or "scalar" without "<>".'
        );
}

function printTypedError(type, msg) {

    switch (type) {
    case Errors.TYPE.INVALID_TYPE:
        return 'Property "' + msg.propName + '" has type "' + msg.propType + '"';

    case Errors.TYPE.INVALID_VAR_TYPE:
        return 'Property "' + msg.propName + '" has type "' + msg.propType + '" (from variable "' + msg.varName + '")';

    case Errors.TYPE.STRING_HAS_TAGS:
        return 'Property "' + msg.propName + '" contains invalid characters';

    default:
        return 'Unknown error. Please file the issue to github.';
    }

}

/**
 * Simple util for prepending spaces to the string until it fits specified size.
 *
 * @param {String} s
 * @param {Number} len
 * @returns {String}
 */
function prependSpaces(s, len) {
    while (s.length < len) {
        s = ' ' + s;
    }
    return s;
}

/**
 * Renders single line of code in style error formatted output.
 *
 * @param {Number} n line number
 * @param {String} line
 * @param {Boolean} colorize
 * @returns {String}
 */
function renderLine(n, line, colorize) {
    // Convert tabs to spaces, so errors in code lines with tabs as indention symbol
    // could be correctly rendered, plus it will provide less verbose output
    line = line.replace(/\t/g, ' ');

    // "n + 1" to print lines in human way (counted from 1)
    var lineNumber = prependSpaces((n + 1).toString(), 5) + ' |';
    return ' ' + (colorize ? colors.grey(lineNumber) : lineNumber) + line;
}

/**
 * Renders pointer:
 * ---------------^
 *
 * @param {Number} column
 * @param {Boolean} colorize
 * @returns {String}
 */
function renderPointer(column, colorize) {
    var res = (new Array(column + 9)).join('-') + '^';
    return colorize ? colors.grey(res) : res;
}

module.exports = Errors;
