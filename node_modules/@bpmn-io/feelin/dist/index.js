import { FixedOffsetZone, Duration, DateTime, SystemZone, Info } from 'luxon';
import { normalizeContextKey, parser, trackVariables } from '@bpmn-io/lezer-feel';
import { has } from 'min-dash';

function isNil(e) {
    return e === null || e === undefined;
}
function isContext(e) {
    return !isNil(e) && Object.getPrototypeOf(e) === Object.prototype;
}
function isDateTime(obj) {
    return DateTime.isDateTime(obj);
}
function isDuration(obj) {
    return Duration.isDuration(obj);
}
function isArray(e) {
    return Array.isArray(e);
}
function isBoolean(e) {
    return typeof e === 'boolean';
}
function getType(e) {
    if (isNil(e)) {
        return 'nil';
    }
    if (isBoolean(e)) {
        return 'boolean';
    }
    if (isNumber(e)) {
        return 'number';
    }
    if (isString(e)) {
        return 'string';
    }
    if (isContext(e)) {
        return 'context';
    }
    if (isArray(e)) {
        return 'list';
    }
    if (isDuration(e)) {
        return 'duration';
    }
    if (isDateTime(e)) {
        if (e.year === 1900 &&
            e.month === 1 &&
            e.day === 1) {
            return 'time';
        }
        if (e.hour === 0 &&
            e.minute === 0 &&
            e.second === 0 &&
            e.millisecond === 0 &&
            e.zone === FixedOffsetZone.utcInstance) {
            return 'date';
        }
        return 'date time';
    }
    if (e instanceof Range) {
        return 'range';
    }
    if (e instanceof FunctionWrapper) {
        return 'function';
    }
    return 'literal';
}
function isType(el, type) {
    return getType(el) === type;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function typeCast(obj, type) {
    if (isDateTime(obj)) {
        if (type === 'time') {
            return obj.set({
                year: 1900,
                month: 1,
                day: 1
            });
        }
        if (type === 'date') {
            return obj.setZone('utc', { keepLocalTime: true }).startOf('day');
        }
        if (type === 'date time') {
            return obj;
        }
    }
    return null;
}
class Range {
    constructor(props) {
        Object.assign(this, props);
    }
}
function isNumber(obj) {
    return typeof obj === 'number';
}
function isString(obj) {
    return typeof obj === 'string';
}
function equals(a, b, strict = false) {
    if (a === null && b !== null ||
        a !== null && b === null) {
        return false;
    }
    if (isArray(a) && a.length < 2) {
        a = a[0];
    }
    if (isArray(b) && b.length < 2) {
        b = b[0];
    }
    const aType = getType(a);
    const bType = getType(b);
    const temporalTypes = ['date time', 'time', 'date'];
    if (temporalTypes.includes(aType)) {
        if (!temporalTypes.includes(bType)) {
            return null;
        }
        if (aType === 'time' && bType !== 'time') {
            return null;
        }
        if (bType === 'time' && aType !== 'time') {
            return null;
        }
        if (strict || a.zone === SystemZone.instance || b.zone === SystemZone.instance) {
            return a.equals(b);
        }
        else {
            return a.toUTC().valueOf() === b.toUTC().valueOf();
        }
    }
    if (aType !== bType) {
        return null;
    }
    if (aType === 'nil') {
        return true;
    }
    if (aType === 'list') {
        if (a.length !== b.length) {
            return false;
        }
        return a.every((element, idx) => equals(element, b[idx]));
    }
    if (aType === 'duration') {
        // years and months duration -> months
        if (Math.abs(a.as('days')) > 180) {
            return Math.trunc(a.minus(b).as('months')) === 0;
        }
        // days and time duration -> seconds
        else {
            return Math.trunc(a.minus(b).as('seconds')) === 0;
        }
    }
    if (aType === 'context') {
        const aEntries = Object.entries(a);
        const bEntries = Object.entries(b);
        if (aEntries.length !== bEntries.length) {
            return false;
        }
        return aEntries.every(([key, value]) => key in b && equals(value, b[key]));
    }
    if (aType === 'range') {
        return [
            [a.start, b.start],
            [a.end, b.end],
            [a['start included'], b['start included']],
            [a['end included'], b['end included']]
        ].every(([a, b]) => a === b);
    }
    if (a == b) {
        return true;
    }
    return aType === bType ? false : null;
}
const FUNCTION_PARAMETER_MISSMATCH = {};
class FunctionWrapper {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(fn, parameterNames) {
        this.fn = fn;
        this.parameterNames = parameterNames;
    }
    invoke(contextOrArgs) {
        let params;
        if (isArray(contextOrArgs)) {
            params = contextOrArgs;
            // reject
            if (params.length > this.parameterNames.length) {
                const lastParam = this.parameterNames[this.parameterNames.length - 1];
                // strictly check for parameter count provided
                // for non var-args functions
                if (!lastParam || !lastParam.startsWith('...')) {
                    return FUNCTION_PARAMETER_MISSMATCH;
                }
            }
        }
        else {
            // strictly check for required parameter names,
            // and fail on wrong parameter name
            if (Object.keys(contextOrArgs).some(key => !this.parameterNames.includes(key) && !this.parameterNames.includes(`...${key}`))) {
                return FUNCTION_PARAMETER_MISSMATCH;
            }
            params = this.parameterNames.reduce((params, name) => {
                if (name.startsWith('...')) {
                    name = name.slice(3);
                    const value = contextOrArgs[name];
                    if (!value) {
                        return params;
                    }
                    else {
                        // ensure that single arg provided for var args named
                        // parameter is wrapped in a list
                        return [...params, ...(isArray(value) ? value : [value])];
                    }
                }
                return [...params, contextOrArgs[name]];
            }, []);
        }
        return this.fn.call(null, ...params);
    }
}

function parseParameterNames(fn) {
    if (Array.isArray(fn.$args)) {
        return fn.$args;
    }
    const code = fn.toString();
    const match = /^(?:[^(]*\s*)?\(([^)]+)?\)/.exec(code);
    if (!match) {
        throw new Error('failed to parse params: ' + code);
    }
    const [_, params] = match;
    if (!params) {
        return [];
    }
    return params.split(',').map(p => p.trim());
}
function notImplemented(thing) {
    return new Error(`not implemented: ${thing}`);
}
function isNotImplemented(err) {
    return /^not implemented/.test(err.message);
}
/**
 * Returns a name from context or undefined if it does not exist.
 *
 * @param {string} name
 * @param {Record<string, any>} context
 *
 * @return {any|undefined}
 */
function getFromContext(name, context) {
    if (['nil', 'boolean', 'number', 'string'].includes(getType(context))) {
        return undefined;
    }
    if (name in context) {
        return context[name];
    }
    const normalizedName = normalizeContextKey(name);
    if (normalizedName in context) {
        return context[normalizedName];
    }
    const entry = Object.entries(context).find(([key]) => normalizedName === normalizeContextKey(key));
    if (entry) {
        return entry[1];
    }
    return undefined;
}

function duration(opts) {
    if (typeof opts === 'number') {
        return Duration.fromMillis(opts);
    }
    return Duration.fromISO(opts);
}
function date(str = null, time = null, zone = null) {
    if (time) {
        if (str) {
            throw new Error('<str> and <time> provided');
        }
        return date(`1900-01-01T${time}`, null);
    }
    if (typeof str === 'string') {
        if (str.startsWith('-')) {
            throw notImplemented('negative date');
        }
        if (!str.includes('T')) {
            // raw dates are in UTC time zone
            return date(str + 'T00:00:00', null, zone || FixedOffsetZone.utcInstance);
        }
        if (str.includes('@')) {
            if (zone) {
                throw new Error('<zone> already provided');
            }
            const [datePart, zonePart] = str.split('@');
            return date(datePart, null, Info.normalizeZone(zonePart));
        }
        return DateTime.fromISO(str.toUpperCase(), {
            setZone: true,
            zone
        });
    }
    return DateTime.now();
}

// 10.3.4 Built-in functions
const builtins = {
    // 10.3.4.1 Conversion functions
    'number': fn(function (from, groupingSeparator, decimalSeparator) {
        // must always provide three arguments
        if (arguments.length !== 3) {
            return null;
        }
        if (groupingSeparator) {
            from = from.split(groupingSeparator).join('');
        }
        if (decimalSeparator && decimalSeparator !== '.') {
            from = from.split('.').join('#').split(decimalSeparator).join('.');
        }
        const number = +from;
        if (isNaN(number)) {
            return null;
        }
        return number;
    }, ['string', 'string?', 'string?'], ['from', 'grouping separator', 'decimal separator']),
    'string': fn(function (from) {
        if (from === null) {
            return null;
        }
        return toString(from);
    }, ['any'], ['from']),
    // date(from) => date string
    // date(from) => date and time
    // date(year, month, day)
    'date': fn(function (year, month, day, from) {
        if (!from && !isNumber(year)) {
            from = year;
            year = null;
        }
        let d;
        if (isString(from)) {
            d = date(from);
        }
        if (isDateTime(from)) {
            d = from;
        }
        if (year) {
            if (!isNumber(month) || !isNumber(day)) {
                return null;
            }
            d = date().setZone('utc').set({
                year,
                month,
                day
            });
        }
        return d && ifValid(d.setZone('utc').startOf('day')) || null;
    }, ['any?', 'number?', 'number?', 'any?'], ['year', 'month', 'day', 'from']),
    // date and time(from) => date time string
    // date and time(date, time)
    'date and time': fn(function (d, time, from) {
        let dt;
        if (isDateTime(d) && isDateTime(time)) {
            const dLocal = d.toLocal();
            dt = time.set({
                year: dLocal.year,
                month: dLocal.month,
                day: dLocal.day
            });
        }
        if (isString(d)) {
            from = d;
            d = null;
        }
        if (isString(from)) {
            dt = date(from, null, from.includes('@') ? null : SystemZone.instance);
        }
        return dt && ifValid(dt) || null;
    }, ['any?', 'time?', 'string?'], ['date', 'time', 'from']),
    // time(from) => time string
    // time(from) => time, date and time
    // time(hour, minute, second, offset?) => ...
    'time': fn(function (hour, minute, second, offset, from) {
        let t;
        if (offset) {
            throw notImplemented('time(..., offset)');
        }
        if (isString(hour) || isDateTime(hour)) {
            from = hour;
            hour = null;
        }
        if (isString(from) && from) {
            t = date(null, from);
        }
        if (isDateTime(from)) {
            t = from.set({
                year: 1900,
                month: 1,
                day: 1
            });
        }
        if (isNumber(hour)) {
            if (!isNumber(minute) || !isNumber(second)) {
                return null;
            }
            // TODO: support offset = days and time duration
            t = date().set({
                hour,
                minute,
                second
            }).set({
                year: 1900,
                month: 1,
                day: 1,
                millisecond: 0
            });
        }
        return t && ifValid(t) || null;
    }, ['any?', 'number?', 'number?', 'any?', 'any?'], ['hour', 'minute', 'second', 'offset', 'from']),
    'duration': fn(function (from) {
        return ifValid(duration(from));
    }, ['string'], ['from']),
    'years and months duration': fn(function (from, to) {
        return ifValid(to.diff(from, ['years', 'months']));
    }, ['date', 'date'], ['from', 'to']),
    '@': fn(function (string) {
        let t;
        if (/^-?P/.test(string)) {
            t = duration(string);
        }
        else if (/^[\d]{1,2}:[\d]{1,2}:[\d]{1,2}/.test(string)) {
            t = date(null, string);
        }
        else {
            t = date(string);
        }
        return t && ifValid(t) || null;
    }, ['string']),
    'now': fn(function () {
        return date();
    }, [], []),
    'today': fn(function () {
        return date().startOf('day');
    }, [], []),
    // 10.3.4.2 Boolean function
    'not': fn(function (negand) {
        return isType(negand, 'boolean') ? !negand : null;
    }, ['any'], ['negand']),
    // 10.3.4.3 String functions
    'substring': fn(function (string, start, length) {
        const _start = (start < 0 ? string.length + start : start - 1);
        const arr = Array.from(string);
        return (typeof length !== 'undefined'
            ? arr.slice(_start, _start + length)
            : arr.slice(_start)).join('');
    }, ['string', 'number', 'number?'], ['string', 'start position', 'length']),
    'string length': fn(function (string) {
        return countSymbols(string);
    }, ['string'], ['string']),
    'upper case': fn(function (string) {
        return string.toUpperCase();
    }, ['string'], ['string']),
    'lower case': fn(function (string) {
        return string.toLowerCase();
    }, ['string'], ['string']),
    'substring before': fn(function (string, match) {
        const index = string.indexOf(match);
        if (index === -1) {
            return '';
        }
        return string.substring(0, index);
    }, ['string', 'string'], ['string', 'match']),
    'substring after': fn(function (string, match) {
        const index = string.indexOf(match);
        if (index === -1) {
            return '';
        }
        return string.substring(index + match.length);
    }, ['string', 'string'], ['string', 'match']),
    'replace': fn(function (input, pattern, replacement, flags) {
        const regexp = createRegexp(pattern, flags || '', 'g');
        return regexp && input.replace(regexp, replacement.replace(/\$0/g, '$$&'));
    }, ['string', 'string', 'string', 'string?'], ['input', 'pattern', 'replacement', 'flags']),
    'contains': fn(function (string, match) {
        return string.includes(match);
    }, ['string', 'string'], ['string', 'match']),
    'matches': fn(function (input, pattern, flags) {
        const regexp = createRegexp(pattern, flags || '', '');
        return regexp && regexp.test(input);
    }, ['string', 'string', 'string?'], ['input', 'pattern', 'flags']),
    'starts with': fn(function (string, match) {
        return string.startsWith(match);
    }, ['string', 'string'], ['string', 'match']),
    'ends with': fn(function (string, match) {
        return string.endsWith(match);
    }, ['string', 'string'], ['string', 'match']),
    'split': fn(function (string, delimiter) {
        const regexp = createRegexp(delimiter, '', '');
        return regexp && string.split(regexp);
    }, ['string', 'string'], ['string', 'delimiter']),
    'string join': fn(function (list, delimiter) {
        if (list.some(e => !isString(e) && e !== null)) {
            return null;
        }
        return list.filter(l => l !== null).join(delimiter || '');
    }, ['list', 'string?'], ['list', 'delimiter']),
    // 10.3.4.4 List functions
    'list contains': fn(function (list, element) {
        return list.some(el => matches(el, element));
    }, ['list', 'any?'], ['list', 'element']),
    // list replace(list, position, newItem)
    // list replace(list, match, newItem)
    'list replace': fn(function (list, position, newItem, match) {
        const matcher = position || match;
        if (!['number', 'function'].includes(getType(matcher))) {
            return null;
        }
        return listReplace(list, position || match, newItem);
    }, ['list', 'any?', 'any', 'function?'], ['list', 'position', 'newItem', 'match']),
    'count': fn(function (list) {
        return list.length;
    }, ['list'], ['list']),
    'min': listFn(function (...list) {
        return list.reduce((min, el) => min === null ? el : Math.min(min, el), null);
    }, 'number', ['...list']),
    'max': listFn(function (...list) {
        return list.reduce((max, el) => max === null ? el : Math.max(max, el), null);
    }, 'number', ['...list']),
    'sum': listFn(function (...list) {
        return sum(list);
    }, 'number', ['...list']),
    'mean': listFn(function (...list) {
        const s = sum(list);
        return s === null ? s : s / list.length;
    }, 'number', ['...list']),
    'all': listFn(function (...list) {
        let nonBool = false;
        for (const o of list) {
            if (o === false) {
                return false;
            }
            if (typeof o !== 'boolean') {
                nonBool = true;
            }
        }
        return nonBool ? null : true;
    }, 'any?', ['...list']),
    'any': listFn(function (...list) {
        let nonBool = false;
        for (const o of list) {
            if (o === true) {
                return true;
            }
            if (typeof o !== 'boolean') {
                nonBool = true;
            }
        }
        return nonBool ? null : false;
    }, 'any?', ['...list']),
    'sublist': fn(function (list, start, length) {
        const _start = (start < 0 ? list.length + start : start - 1);
        return (typeof length !== 'undefined'
            ? list.slice(_start, _start + length)
            : list.slice(_start));
    }, ['list', 'number', 'number?'], ['list', 'start', 'length']),
    'append': fn(function (list, ...items) {
        return list.concat(items);
    }, ['list', 'any?'], ['list', '...item']),
    'concatenate': fn(function (...list) {
        return list.reduce((result, arg) => {
            return result.concat(arg);
        }, []);
    }, ['any'], ['...list']),
    'insert before': fn(function (list, position, newItem) {
        return list.slice(0, position - 1).concat([newItem], list.slice(position - 1));
    }, ['list', 'number', 'any?'], ['list', 'position', 'newItem']),
    'remove': fn(function (list, position) {
        return list.slice(0, position - 1).concat(list.slice(position));
    }, ['list', 'number'], ['list', 'position']),
    'reverse': fn(function (list) {
        return list.slice().reverse();
    }, ['list'], ['list']),
    'index of': fn(function (list, match) {
        return list.reduce(function (result, element, index) {
            if (matches(element, match)) {
                result.push(index + 1);
            }
            return result;
        }, []);
    }, ['list', 'any'], ['list', 'match']),
    'union': listFn(function (...lists) {
        return lists.reduce((result, list) => {
            return list.reduce((result, e) => {
                if (!result.some(r => equals(e, r))) {
                    result.push(e);
                }
                return result;
            }, result);
        }, []);
    }, 'list', ['...list']),
    'distinct values': fn(function (list) {
        return list.reduce((result, e) => {
            if (!result.some(r => equals(e, r))) {
                result.push(e);
            }
            return result;
        }, []);
    }, ['list'], ['list']),
    'flatten': fn(function (list) {
        return flatten(list);
    }, ['list'], ['list']),
    'product': listFn(function (...list) {
        if (list.length === 0) {
            return null;
        }
        return list.reduce((result, n) => {
            return result * n;
        }, 1);
    }, 'number', ['...list']),
    'median': listFn(function (...list) {
        if (list.length === 0) {
            return null;
        }
        return median(list);
    }, 'number', ['...list']),
    'stddev': listFn(function (...list) {
        if (list.length < 2) {
            return null;
        }
        return stddev(list);
    }, 'number', ['...list']),
    'mode': listFn(function (...list) {
        return mode(list);
    }, 'number', ['...list']),
    // 10.3.4.5 Numeric functions
    'decimal': fn(function (n, scale) {
        if (n === null || scale === null)
            return null;
        return offsetted(bankersRound, n, scale);
    }, ['number', 'number'], ['n', 'scale']),
    'floor': fn(function (n, scale = 0) {
        if (scale === null) {
            return null;
        }
        const adjust = Math.pow(10, scale);
        return Math.floor(n * adjust) / adjust;
    }, ['number', 'number?'], ['n', 'scale']),
    'ceiling': fn(function (n, scale = 0) {
        if (scale === null) {
            return null;
        }
        const adjust = Math.pow(10, scale);
        return Math.ceil(n * adjust) / adjust;
    }, ['number', 'number?'], ['n', 'scale']),
    'abs': fn(function (n) {
        if (typeof n !== 'number') {
            return null;
        }
        return Math.abs(n);
    }, ['number'], ['n']),
    'round up': fn(function (n, scale) {
        if (n === null || scale === null)
            return null;
        return n > 0 ? offsetted(Math.ceil, n, scale) : offsetted(Math.floor, n, scale);
    }, ['number', 'number'], ['n', 'scale']),
    'round down': fn(function (n, scale) {
        if (n === null || scale === null)
            return null;
        return n > 0 ? offsetted(Math.floor, n, scale) : offsetted(Math.ceil, n, scale);
    }, ['number', 'number'], ['n', 'scale']),
    'round half up': fn(function (n, scale) {
        if (n === null || scale === null)
            return null;
        const remainder = (n * Math.pow(10, scale)) % 1;
        if (Math.abs(remainder) === 0.5) {
            return offsetted(n > 0 ? Math.ceil : Math.floor, n, scale);
        }
        return offsetted(Math.round, n, scale);
    }, ['number', 'number'], ['n', 'scale']),
    'round half down': fn(function (n, scale) {
        if (n === null || scale === null)
            return null;
        const remainder = (n * Math.pow(10, scale)) % 1;
        if (Math.abs(remainder) === 0.5) {
            return offsetted(n > 0 ? Math.floor : Math.ceil, n, scale);
        }
        return offsetted(Math.round, n, scale);
    }, ['number', 'number'], ['n', 'scale']),
    'modulo': fn(function (dividend, divisor) {
        if (!divisor) {
            return null;
        }
        const adjust = 1000000000;
        // cf. https://dustinpfister.github.io/2017/09/02/js-whats-wrong-with-modulo/
        //
        // need to round here as using this custom modulo
        // variant is prone to rounding errors
        return Math.round((dividend % divisor + divisor) % divisor * adjust) / adjust;
    }, ['number', 'number'], ['dividend', 'divisor']),
    'sqrt': fn(function (number) {
        if (number < 0) {
            return null;
        }
        return Math.sqrt(number);
    }, ['number'], ['number']),
    'log': fn(function (number) {
        if (number <= 0) {
            return null;
        }
        return Math.log(number);
    }, ['number'], ['number']),
    'exp': fn(function (number) {
        return Math.exp(number);
    }, ['number'], ['number']),
    'odd': fn(function (number) {
        return Math.abs(number) % 2 === 1;
    }, ['number'], ['number']),
    'even': fn(function (number) {
        return Math.abs(number) % 2 === 0;
    }, ['number'], ['number']),
    // 10.3.4.6 Date and time functions
    'is': fn(function (value1, value2) {
        if (typeof value1 === 'undefined' || typeof value2 === 'undefined') {
            return false;
        }
        return equals(value1, value2, true);
    }, ['any?', 'any?'], ['value1', 'value2']),
    // 10.3.4.7 Range Functions
    'before': fn(function (a, b) {
        return before(a, b);
    }, ['any', 'any'], ['a', 'b']),
    'after': fn(function (a, b) {
        return before(b, a);
    }, ['any', 'any'], ['a', 'b']),
    'meets': fn(function (range1, range2) {
        return meetsRange(range1, range2);
    }, ['range', 'range'], ['range1', 'range2']),
    'met by': fn(function (range1, range2) {
        return meetsRange(range2, range1);
    }, ['range', 'range'], ['range1', 'range2']),
    'overlaps': fn(function (range1, range2) {
        return !before(range1, range2) && !before(range2, range1);
    }, ['range', 'range'], ['range1', 'range2']),
    'overlaps before': fn(function () {
        throw notImplemented('overlaps before');
    }, ['any?']),
    'overlaps after': fn(function () {
        throw notImplemented('overlaps after');
    }, ['any?']),
    'finishes': fn(function () {
        throw notImplemented('finishes');
    }, ['any?']),
    'finished by': fn(function () {
        throw notImplemented('finished by');
    }, ['any?']),
    'includes': fn(function (range, value) {
        return includesRange(range, value);
    }, ['range', 'any'], ['range', 'value']),
    'during': fn(function () {
        throw notImplemented('during');
    }, ['any?']),
    'starts': fn(function () {
        throw notImplemented('starts');
    }, ['any?']),
    'started by': fn(function () {
        throw notImplemented('started by');
    }, ['any?']),
    'coincides': fn(function () {
        throw notImplemented('coincides');
    }, ['any?']),
    // 10.3.4.8 Temporal built-in functions
    'day of year': fn(function (date) {
        return date.ordinal;
    }, ['date time'], ['date']),
    'day of week': fn(function (date) {
        return date.weekdayLong;
    }, ['date time'], ['date']),
    'month of year': fn(function (date) {
        return date.monthLong;
    }, ['date time'], ['date']),
    'week of year': fn(function (date) {
        return date.weekNumber;
    }, ['date time'], ['date']),
    // 10.3.4.9 Sort
    'sort': fn(function (list, precedes) {
        return Array.from(list).sort((a, b) => precedes.invoke([a, b]) ? -1 : 1);
    }, ['list', 'function'], ['list', 'precedes']),
    // 10.3.4.10 Context function
    'get value': fn(function (m, key) {
        const value = getFromContext(key, m);
        return value != undefined ? value : null;
    }, ['context', 'string'], ['m', 'key']),
    'get entries': fn(function (m) {
        if (arguments.length !== 1) {
            return null;
        }
        if (Array.isArray(m)) {
            return null;
        }
        return Object.entries(m).map(([key, value]) => ({ key, value }));
    }, ['context'], ['m']),
    'context': listFn(function (...entries) {
        const context = entries.reduce((context, entry) => {
            if (context === FALSE || !['key', 'value'].every(e => e in entry)) {
                return FALSE;
            }
            const key = entry.key;
            if (key === null) {
                return FALSE;
            }
            if (key in context) {
                return FALSE;
            }
            return Object.assign(Object.assign({}, context), { [entry.key]: entry.value });
        }, {});
        if (context === FALSE) {
            return null;
        }
        return context;
    }, 'context', ['...entries']),
    'context merge': listFn(function (...contexts) {
        return Object.assign({}, ...contexts);
    }, 'context', ['...contexts']),
    'context put': fn(function (context, keys, value, key) {
        if (typeof keys === 'undefined' && typeof key === 'undefined') {
            return null;
        }
        return contextPut(context, keys || [key], value);
    }, ['context', 'list?', 'any', 'string?'], ['context', 'keys', 'value', 'key'])
};
/**
 * @param {Object} context
 * @param {string[]} keys
 * @param {any} value
 */
function contextPut(context, keys, value) {
    const [key, ...remainingKeys] = keys;
    if (getType(key) !== 'string') {
        return null;
    }
    if (getType(context) === 'nil') {
        return null;
    }
    if (remainingKeys.length) {
        value = contextPut(context[key], remainingKeys, value);
        if (value === null) {
            return null;
        }
    }
    return Object.assign(Object.assign({}, context), { [key]: value });
}
function matches(a, b) {
    return a === b;
}
const FALSE = {};
function createArgTester(arg) {
    const optional = arg.endsWith('?');
    const type = optional ? arg.substring(0, arg.length - 1) : arg;
    return function (obj) {
        const arr = Array.isArray(obj);
        if (type === 'list') {
            if (arr || optional && typeof obj === 'undefined') {
                return obj;
            }
            else {
                // implicit conversion obj => [ obj ]
                return obj === null ? FALSE : [obj];
            }
        }
        if (type !== 'any' && arr && obj.length === 1) {
            // implicit conversion [ obj ] => obj
            obj = obj[0];
        }
        const objType = getType(obj);
        if (type === 'any' || type === objType) {
            return optional ? obj : typeof obj !== 'undefined' ? obj : FALSE;
        }
        if (objType === 'nil') {
            return (optional ? obj : FALSE);
        }
        return typeCast(obj, type) || FALSE;
    };
}
function createArgsValidator(argDefinitions) {
    const tests = argDefinitions.map(createArgTester);
    return function (args) {
        while (args.length < argDefinitions.length) {
            args.push(undefined);
        }
        return args.reduce((result, arg, index) => {
            if (result === false) {
                return result;
            }
            const test = tests[index];
            const conversion = test ? test(arg) : arg;
            if (conversion === FALSE) {
                return false;
            }
            result.push(conversion);
            return result;
        }, []);
    };
}
/**
 * @param {Function} fnDefinition
 * @param {string} type
 * @param {string[]} [parameterNames]
 *
 * @return {Function}
 */
function listFn(fnDefinition, type, parameterNames = null) {
    const tester = createArgTester(type);
    const wrappedFn = function (...args) {
        if (args.length === 0) {
            return null;
        }
        // unwrap first arg
        if (Array.isArray(args[0]) && args.length === 1) {
            args = args[0];
        }
        if (!args.every(arg => tester(arg) !== FALSE)) {
            return null;
        }
        return fnDefinition(...args);
    };
    wrappedFn.$args = parameterNames || parseParameterNames(fnDefinition);
    return wrappedFn;
}
/**
 * @param {Function} fnDefinition
 * @param {string[]} argDefinitions
 * @param {string[]} [parameterNames]
 *
 * @return {Function}
 */
function fn(fnDefinition, argDefinitions, parameterNames = null) {
    const checkArgs = createArgsValidator(argDefinitions);
    parameterNames = parameterNames || parseParameterNames(fnDefinition);
    const wrappedFn = function (...args) {
        const convertedArgs = checkArgs(args);
        if (!convertedArgs) {
            return null;
        }
        return fnDefinition(...convertedArgs);
    };
    wrappedFn.$args = parameterNames;
    return wrappedFn;
}
/**
 * @param {Range} a
 * @param {Range} b
 */
function meetsRange(a, b) {
    return [
        (a.end === b.start),
        (a['end included'] === true),
        (b['start included'] === true)
    ].every(v => v);
}
/**
 * @param {Range|number} a
 * @param {Range|number} b
 */
function before(a, b) {
    if (a instanceof Range && b instanceof Range) {
        return (a.end < b.start || (!a['end included'] || !b['start included']) && a.end == b.start);
    }
    if (a instanceof Range) {
        return (a.end < b || (!a['end included'] && a.end === b));
    }
    if (b instanceof Range) {
        return (b.start > a || (!b['start included'] && b.start === a));
    }
    return a < b;
}
/**
 * @param {Range} container - The range that should contain the other value
 * @param {Range|number} value - The range or point to check if contained
 */
function includesRange(container, value) {
    if (!(container instanceof Range)) {
        return false;
    }
    // Range includes another range
    if (value instanceof Range) {
        const startOk = (container.start < value.start ||
            (container.start === value.start &&
                (container['start included'] || !value['start included'])));
        // Check end boundary: container.end >= value.end
        const endOk = (container.end > value.end ||
            (container.end === value.end &&
                (container['end included'] || !value['end included'])));
        return startOk && endOk;
    }
    // Range includes a point
    // Check if point is within [start, end] considering inclusive/exclusive
    const afterStart = (value > container.start ||
        (value === container.start && container['start included']));
    const beforeEnd = (value < container.end ||
        (value === container.end && container['end included']));
    return afterStart && beforeEnd;
}
function sum(list) {
    return list.reduce((sum, el) => sum === null ? el : sum + el, null);
}
function flatten([x, ...xs]) {
    return (x !== undefined
        ? [...Array.isArray(x) ? flatten(x) : [x], ...flatten(xs)]
        : []);
}
function toKeyString(key) {
    if (typeof key === 'string' && /\W/.test(key)) {
        return toString(key, true);
    }
    return key;
}
function toDeepString(obj) {
    return toString(obj, true);
}
function escapeStr(str) {
    return str.replace(/("|\\)/g, '\\$1');
}
function toString(obj, wrap = false) {
    var _a, _b, _c, _d;
    const type = getType(obj);
    if (type === 'nil') {
        return 'null';
    }
    if (type === 'string') {
        return wrap ? `"${escapeStr(obj)}"` : obj;
    }
    if (type === 'boolean' || type === 'number') {
        return String(obj);
    }
    if (type === 'list') {
        return '[' + obj.map(toDeepString).join(', ') + ']';
    }
    if (type === 'context') {
        return '{' + Object.entries(obj).map(([key, value]) => {
            return toKeyString(key) + ': ' + toDeepString(value);
        }).join(', ') + '}';
    }
    if (type === 'duration') {
        return obj.shiftTo('years', 'months', 'days', 'hours', 'minutes', 'seconds').normalize().toISO();
    }
    if (type === 'date time') {
        if (obj.zone === SystemZone.instance) {
            return obj.toISO({ suppressMilliseconds: true, includeOffset: false });
        }
        if ((_a = obj.zone) === null || _a === void 0 ? void 0 : _a.zoneName) {
            return obj.toISO({ suppressMilliseconds: true, includeOffset: false }) + '@' + ((_b = obj.zone) === null || _b === void 0 ? void 0 : _b.zoneName);
        }
        return obj.toISO({ suppressMilliseconds: true });
    }
    if (type === 'date') {
        return obj.toISODate();
    }
    if (type === 'range') {
        return '<range>';
    }
    if (type === 'time') {
        if (obj.zone === SystemZone.instance) {
            return obj.toISOTime({ suppressMilliseconds: true, includeOffset: false });
        }
        if ((_c = obj.zone) === null || _c === void 0 ? void 0 : _c.zoneName) {
            return obj.toISOTime({ suppressMilliseconds: true, includeOffset: false }) + '@' + ((_d = obj.zone) === null || _d === void 0 ? void 0 : _d.zoneName);
        }
        return obj.toISOTime({ suppressMilliseconds: true });
    }
    if (type === 'function') {
        return '<function>';
    }
    throw notImplemented('string(' + type + ')');
}
function countSymbols(str) {
    // cf. https://mathiasbynens.be/notes/javascript-unicode
    return str.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '_').length;
}
function offsetted(func, n, scale) {
    const result = func(n * Math.pow(10, scale)) / Math.pow(10, scale);
    return isNaN(result) ? n : result;
}
function bankersRound(n) {
    const floored = Math.floor(n);
    const decimalPart = n - floored;
    if (decimalPart === 0.5) {
        return (floored % 2 === 0) ? floored : floored + 1;
    }
    return Math.round(n);
}
// adapted from https://stackoverflow.com/a/53577159
function stddev(array) {
    const n = array.length;
    const mean = array.reduce((a, b) => a + b) / n;
    return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / (n - 1));
}
function listReplace(list, matcher, newItem) {
    if (isNumber(matcher)) {
        return [...list.slice(0, matcher - 1), newItem, ...list.slice(matcher)];
    }
    return list.map((item, _idx) => {
        if (matcher.invoke([item, newItem])) {
            return newItem;
        }
        else {
            return item;
        }
    });
}
function median(array) {
    const n = array.length;
    const sorted = array.slice().sort();
    const mid = n / 2 - 1;
    const index = Math.ceil(mid);
    // even
    if (mid === index) {
        return (sorted[index] + sorted[index + 1]) / 2;
    }
    // uneven
    return sorted[index];
}
function mode(array) {
    if (array.length < 2) {
        return array;
    }
    const buckets = {};
    for (const n of array) {
        buckets[n] = (buckets[n] || 0) + 1;
    }
    const sorted = Object.entries(buckets).sort((a, b) => b[1] - a[1]);
    return sorted.filter(s => s[1] === sorted[0][1]).map(e => +e[0]);
}
function ifValid(o) {
    return o.isValid ? o : null;
}
/**
 * Concatenates flags for a regular expression.
 *
 * Ensures that default flags are included without duplication, even if
 * user-specified flags overlap with the defaults.
 */
function buildFlags(flags, defaultFlags) {
    const unsupportedFlags = flags.replace(/[smix]/g, '');
    if (unsupportedFlags) {
        throw new Error('illegal flags: ' + unsupportedFlags);
    }
    // we don't implement the <x> flag
    if (/x/.test(flags)) {
        throw notImplemented('matches <x> flag');
    }
    return flags + defaultFlags;
}
/**
 * Creates a regular expression from a given pattern
 */
function createRegexp(pattern, flags, defaultFlags = '') {
    try {
        return new RegExp(pattern, 'u' + buildFlags(flags, defaultFlags));
    }
    catch (_err) {
        if (isNotImplemented(_err)) {
            throw _err;
        }
    }
    return null;
}

function parseExpression(expression, context = {}, dialect) {
    return parser.configure({
        top: 'Expression',
        contextTracker: trackVariables(context),
        dialect
    }).parse(expression);
}
function parseUnaryTests(expression, context = {}, dialect) {
    return parser.configure({
        top: 'UnaryTests',
        contextTracker: trackVariables(context),
        dialect
    }).parse(expression);
}

class SyntaxError extends Error {
    constructor(message, details) {
        super(message);
        Object.assign(this, details);
    }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatDetails(template, values) {
    return Object.keys(values).reduce((message, key) => {
        return message.replace(`{${key}}`, `'${formatValue(values[key])}'`);
    }, template);
}
class InterpreterContext {
    constructor() {
        this.warnings = [];
    }
    addWarning(node, type, details) {
        this.warnings.push({
            type,
            message: formatDetails(details.template, details.values),
            details,
            position: node.position
        });
    }
    getWarnings() {
        return this.warnings;
    }
}
class Interpreter {
    _buildExecutionTree(tree, input, interpreterContext) {
        const root = {
            args: [],
            node: {
                name: '__ROOT',
                input,
                position: {
                    from: 0,
                    to: input.length
                }
            }
        };
        const stack = [root];
        tree.iterate({
            enter(nodeRef) {
                const { isError, isSkipped } = nodeRef.type;
                if (isError) {
                    throw lintError(input, nodeRef);
                }
                if (isSkipped) {
                    return false;
                }
                const { from, to, name } = nodeRef;
                stack.push({
                    args: [],
                    node: {
                        name,
                        input: input.slice(from, to),
                        position: {
                            from,
                            to
                        }
                    }
                });
            },
            leave(nodeRef) {
                if (nodeRef.type.isSkipped) {
                    return;
                }
                const { node, args } = stack.pop();
                const parent = stack[stack.length - 1];
                const expr = evalNode(node, args, interpreterContext);
                parent.args.push(expr);
            }
        });
        return {
            root: root.args[root.args.length - 1]
        };
    }
    evaluate(expression, evalContext, dialect, interpreterContext) {
        const parseTree = parseExpression(expression, evalContext, dialect);
        const { root } = this._buildExecutionTree(parseTree, expression, interpreterContext);
        return {
            parseTree,
            root
        };
    }
    unaryTest(expression, evalContext, dialect, interpreterContext) {
        const parseTree = parseUnaryTests(expression, evalContext, dialect);
        const { root } = this._buildExecutionTree(parseTree, expression, interpreterContext);
        return {
            parseTree,
            root
        };
    }
}
const interpreter = new Interpreter();
function unaryTest(expression, evalContext = {}, dialect) {
    const interpreterContext = new InterpreterContext();
    const value = evalContext['?'] !== undefined ? evalContext['?'] : null;
    const { root } = interpreter.unaryTest(expression, evalContext, dialect, interpreterContext);
    // root = fn(ctx) => test(val)
    const test = root(evalContext);
    const testResult = test(value);
    return {
        value: testResult,
        warnings: interpreterContext.getWarnings()
    };
}
function evaluate(expression, evalContext = {}, dialect) {
    const interpreterContext = new InterpreterContext();
    const { root } = interpreter.evaluate(expression, evalContext, dialect, interpreterContext);
    // root = Expression :: fn(ctx)
    const result = root(evalContext);
    return {
        value: result,
        warnings: interpreterContext.getWarnings()
    };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function evalNode(node, args, interpreterContext) {
    switch (node.name) {
        case 'ArithOp': return (context) => {
            const nullable = (op, opName, types = ['number']) => (a, b) => {
                const left = a(context);
                const right = b(context);
                if (isArray(left) || isArray(right)) {
                    interpreterContext.addWarning(node, 'INVALID_TYPE', {
                        template: `Can't ${opName} {right} to {left}`,
                        values: {
                            left,
                            right
                        }
                    });
                    return null;
                }
                const leftType = getType(left);
                const rightType = getType(right);
                const temporal = ['date', 'time', 'date time', 'duration'];
                if (temporal.includes(leftType)) {
                    if (!temporal.includes(rightType)) {
                        interpreterContext.addWarning(node, 'INVALID_TYPE', {
                            template: `Can't ${opName} {right} to {left}`,
                            values: {
                                left,
                                right
                            }
                        });
                        return null;
                    }
                }
                else if (leftType !== rightType || !types.includes(leftType)) {
                    interpreterContext.addWarning(node, 'INVALID_TYPE', {
                        template: `Can't ${opName} {right} to {left}`,
                        values: {
                            left,
                            right
                        }
                    });
                    return null;
                }
                return op(left, right);
            };
            switch (node.input) {
                case '+': return nullable((a, b) => {
                    // flip these as luxon operations with durations aren't commutative
                    if (isDuration(a) && !isDuration(b)) {
                        const tmp = a;
                        a = b;
                        b = tmp;
                    }
                    if (isType(a, 'time') && isDuration(b)) {
                        return a.plus(b).set({
                            year: 1900,
                            month: 1,
                            day: 1
                        });
                    }
                    else if (isDateTime(a) && isDateTime(b)) {
                        return null;
                    }
                    else if (isDateTime(a) && isDuration(b)) {
                        return a.plus(b);
                    }
                    else if (isDuration(a) && isDuration(b)) {
                        return a.plus(b);
                    }
                    return a + b;
                }, 'add', ['string', 'number', 'date', 'time', 'duration', 'date time']);
                case '-': return nullable((a, b) => {
                    if (isType(a, 'time') && isDuration(b)) {
                        return a.minus(b).set({
                            year: 1900,
                            month: 1,
                            day: 1
                        });
                    }
                    else if (isDateTime(a) && isDateTime(b)) {
                        return a.diff(b);
                    }
                    else if (isDateTime(a) && isDuration(b)) {
                        return a.minus(b);
                    }
                    else if (isDuration(a) && isDuration(b)) {
                        return a.minus(b);
                    }
                    return a - b;
                }, 'subtract', ['number', 'date', 'time', 'duration', 'date time']);
                case '*': return nullable((a, b) => a * b, 'multiply', ['number']);
                case '/': return nullable((a, b) => !b ? null : a / b, 'divide', ['number']);
                case '**':
                case '^': return nullable((a, b) => Math.pow(a, b), 'exponentiate', ['number']);
            }
        };
        case 'CompareOp': return tag(() => {
            switch (node.input) {
                case '>': return (b) => createRange(b, null, false, false);
                case '>=': return (b) => createRange(b, null, true, false);
                case '<': return (b) => createRange(null, b, false, false);
                case '<=': return (b) => createRange(null, b, false, true);
                case '=': return (b) => (a) => equals(a, b);
                case '!=': return (b) => (a) => !equals(a, b);
            }
        }, 'test');
        case 'BacktickIdentifier': return node.input.replace(/`/g, '');
        case 'Wildcard': return (_context) => true;
        case 'null': return tag((_context) => {
            return null;
        }, 'nil');
        case 'Disjunction': return tag((context) => {
            const left = args[0](context);
            const right = args[2](context);
            const matrix = [
                [true, true, true],
                [true, false, true],
                [true, null, true],
                [false, true, true],
                [false, false, false],
                [false, null, null],
                [null, true, true],
                [null, false, null],
                [null, null, null],
            ];
            const a = typeof left === 'boolean' ? left : null;
            const b = typeof right === 'boolean' ? right : null;
            return matrix.find(el => el[0] === a && el[1] === b)[2];
        }, 'test');
        case 'Conjunction': return tag((context) => {
            const left = args[0](context);
            const right = args[2](context);
            const matrix = [
                [true, true, true],
                [true, false, false],
                [true, null, null],
                [false, true, false],
                [false, false, false],
                [false, null, false],
                [null, true, null],
                [null, false, false],
                [null, null, null],
            ];
            const a = typeof left === 'boolean' ? left : null;
            const b = typeof right === 'boolean' ? right : null;
            return matrix.find(el => el[0] === a && el[1] === b)[2];
        }, 'test');
        case 'Context': return (context) => {
            return args.slice(1, -1).reduce((obj, arg) => {
                const [key, value] = arg(Object.assign(Object.assign({}, context), obj));
                return Object.assign(Object.assign({}, obj), { [key]: value });
            }, {});
        };
        case 'FunctionBody': return args[0];
        case 'FormalParameters': return args;
        case 'FormalParameter': return args[0];
        case 'ParameterName': return args.join(' ');
        case 'FunctionDefinition': return (context) => {
            const parameterNames = args[2];
            const fnBody = args[4];
            return wrapFunction((...args) => {
                const fnContext = parameterNames.reduce((context, name, idx) => {
                    // support positional parameters
                    context[name] = args[idx];
                    return context;
                }, Object.assign({}, context));
                return fnBody(fnContext);
            }, parameterNames);
        };
        case 'ContextEntry': return (context) => {
            const key = typeof args[0] === 'function' ? args[0](context) : args[0];
            const value = args[1](context);
            return [key, value];
        };
        case 'Key': return args[0];
        case 'Identifier': return node.input;
        case 'SpecialFunctionName': return (context) => getBuiltin(node.input);
        // preserve spaces in name, but compact multiple
        // spaces into one (token)
        case 'Name': return node.input.replace(/\s{2,}/g, ' ');
        case 'VariableName': return tag((context, local = false) => {
            const name = args.join(' ');
            const contextValue = getFromContext(name, context);
            if (typeof contextValue !== 'undefined') {
                return contextValue;
            }
            const builtin = !local && getBuiltin(name);
            if (builtin) {
                return builtin;
            }
            if (local) {
                if (isContext(context)) {
                    interpreterContext.addWarning(node, 'NO_CONTEXT_ENTRY_FOUND', {
                        template: `Key '${name}' not found in {target}`,
                        values: {
                            target: context
                        }
                    });
                }
                else {
                    interpreterContext.addWarning(node, 'NO_PROPERTY_FOUND', {
                        template: `Property '${name}' not found in {target}`,
                        values: {
                            target: context
                        }
                    });
                }
            }
            else {
                interpreterContext.addWarning(node, 'NO_VARIABLE_FOUND', {
                    template: `Variable '${name}' not found`,
                    values: {}
                });
            }
            return null;
        }, 'any');
        case 'QualifiedName': return (context) => {
            return args.reduce((context, arg) => arg(context), context);
        };
        case '?': return (context) => getFromContext('?', context);
        // expression
        // expression ".." expression
        case 'IterationContext': return (context) => {
            const a = args[0](context);
            const b = args[1] && args[1](context);
            return b ? createRange(a, b) : a;
        };
        case 'Type': return args[0];
        // (x in [ [1,2], [3,4] ]), (y in x)
        case 'InExpressions': return (context) => {
            // we build up evaluation contexts from left to right,
            // ending up with the cartesian product over all available contexts
            //
            // previous context is provided to later context providers
            // producing <null> as a context during evaluation causes the
            // whole result to turn <null>
            const isValidContexts = (contexts) => {
                if (contexts === null || contexts.some(arr => getType(arr) === 'nil')) {
                    return false;
                }
                return true;
            };
            const join = (aContexts, bContextProducer) => {
                return [].concat(...aContexts.map(aContext => {
                    const bContexts = bContextProducer(Object.assign(Object.assign({}, context), aContext));
                    if (!isValidContexts(bContexts)) {
                        return null;
                    }
                    return bContexts.map(bContext => {
                        return Object.assign(Object.assign({}, aContext), bContext);
                    });
                }));
            };
            const cartesian = (aContexts, bContextProducer, ...otherContextProducers) => {
                if (!isValidContexts(aContexts)) {
                    return null;
                }
                if (!bContextProducer) {
                    return aContexts;
                }
                return cartesian(join(aContexts, bContextProducer), ...otherContextProducers);
            };
            const cartesianProduct = (contextProducers) => {
                const [aContextProducer, ...otherContextProducers] = contextProducers;
                const aContexts = aContextProducer(context);
                return cartesian(aContexts, ...otherContextProducers);
            };
            const product = cartesianProduct(args);
            return product && product.map(p => {
                return Object.assign(Object.assign({}, context), p);
            });
        };
        // Name kw<"in"> Expr
        case 'InExpression': return (context) => {
            return extractValue(context, args[0], args[2]);
        };
        case 'SpecialType': throw notImplemented('SpecialType');
        case 'InstanceOfExpression': return tag((context) => {
            const a = args[0](context);
            const b = args[3](context);
            return a instanceof b;
        }, 'test');
        case 'every': return tag((context) => {
            return (_contexts, _condition) => {
                const contexts = _contexts(context);
                if (getType(contexts) !== 'list') {
                    return contexts;
                }
                return contexts.every(ctx => isTruthy(_condition(ctx)));
            };
        }, 'test');
        case 'some': return tag((context) => {
            return (_contexts, _condition) => {
                const contexts = _contexts(context);
                if (getType(contexts) !== 'list') {
                    return contexts;
                }
                return contexts.some(ctx => isTruthy(_condition(ctx)));
            };
        }, 'test');
        case 'NumericLiteral': return tag((_context) => node.input.includes('.') ? parseFloat(node.input) : parseInt(node.input), 'number');
        case 'BooleanLiteral': return tag((_context) => node.input === 'true' ? true : false, 'boolean');
        case 'StringLiteral': return tag((_context) => parseString(node.input), 'string');
        case 'PositionalParameters': return (context) => args.map(arg => arg(context));
        case 'NamedParameter': return (context) => {
            const name = args[0];
            const value = args[1](context);
            return [name, value];
        };
        case 'NamedParameters': return (context) => args.reduce((args, arg) => {
            const [name, value] = arg(context);
            args[name] = value;
            return args;
        }, {});
        case 'DateTimeConstructor': return (context) => {
            return getBuiltin(node.input);
        };
        case 'DateTimeLiteral': return tag((context) => {
            // AtLiteral
            if (args.length === 1) {
                return args[0](context);
            }
            // FunctionInvocation
            else {
                const target = args[0](context);
                const wrappedFn = wrapFunction(target);
                if (!wrappedFn) {
                    interpreterContext.addWarning(node, 'NO_FUNCTION_FOUND', {
                        template: 'Cannot invoke {target}',
                        values: {
                            target
                        }
                    });
                    return null;
                }
                const contextOrArgs = args[2](context);
                const result = wrappedFn.invoke(contextOrArgs);
                if (result === FUNCTION_PARAMETER_MISSMATCH) {
                    interpreterContext.addWarning(node, 'FUNCTION_INVOCATION_FAILURE', {
                        template: 'Cannot invoke {target} with parameters {params}',
                        values: {
                            target: wrappedFn,
                            params: contextOrArgs
                        }
                    });
                    return null;
                }
                return result;
            }
        }, 'date');
        case 'AtLiteral': return tag((context) => {
            const wrappedFn = wrapFunction(getBuiltin('@'));
            if (!wrappedFn) {
                interpreterContext.addWarning(node, 'NO_FUNCTION_FOUND', {
                    template: "Cannot invoke '@'",
                    values: {}
                });
                return null;
            }
            return wrappedFn.invoke([args[0](context)]);
        }, 'date');
        case 'FunctionInvocation': return tag((context) => {
            const target = args[0](context);
            const wrappedFn = wrapFunction(target);
            if (!wrappedFn) {
                interpreterContext.addWarning(node, 'NO_FUNCTION_FOUND', {
                    template: 'Cannot invoke {target}',
                    values: {
                        target
                    }
                });
                return null;
            }
            const contextOrArgs = args[2](context);
            const result = wrappedFn.invoke(contextOrArgs);
            if (result === FUNCTION_PARAMETER_MISSMATCH) {
                interpreterContext.addWarning(node, 'FUNCTION_INVOCATION_FAILURE', {
                    template: 'Cannot invoke {target} with parameters {params}',
                    values: {
                        target: wrappedFn,
                        params: contextOrArgs
                    }
                });
                return null;
            }
            return result;
        }, 'any');
        case 'IfExpression': return (function () {
            const ifCondition = args[1];
            const thenValue = args[3];
            const elseValue = args[5];
            const type = coalecenseTypes(thenValue, elseValue);
            return tag((context) => {
                if (isTruthy(ifCondition(context))) {
                    return thenValue(context);
                }
                else {
                    return elseValue ? elseValue(context) : null;
                }
            }, type);
        })();
        case 'Parameters': return args.length === 3 ? args[1] : (_context) => [];
        case 'Comparison': return tag((context) => {
            const operator = args[1];
            // expression !compare kw<"in"> PositiveUnaryTest |
            // expression !compare kw<"in"> !unaryTest "(" PositiveUnaryTests ")"
            if (operator === 'in') {
                return compareIn(args[0](context), (args[3] || args[2])(context));
            }
            // expression !compare kw<"between"> expression kw<"and"> expression
            if (operator === 'between') {
                const start = args[2](context);
                const end = args[4](context);
                if (start === null || end === null) {
                    return null;
                }
                return createRange(start, end).includes(args[0](context));
            }
            // expression !compare CompareOp<"=" | "!="> expression |
            // expression !compare CompareOp<Gt | Gte | Lt | Lte> expression |
            const left = args[0](context);
            const right = args[2](context);
            const test = operator()(right);
            return compareValue(test, left);
        }, 'test');
        case 'QuantifiedExpression': return tag((context) => {
            const testFn = args[0](context);
            const contexts = args[1];
            const condition = args[3];
            return testFn(contexts, condition);
        }, 'test');
        // DMN 1.2 - 10.3.2.14
        // kw<"for"> commaSep1<InExpression<IterationContext>> kw<"return"> expression
        case 'ForExpression': return (context) => {
            const extractor = args[args.length - 1];
            const iterationContexts = args[1](context);
            if (getType(iterationContexts) !== 'list') {
                return iterationContexts;
            }
            const partial = [];
            for (const ctx of iterationContexts) {
                partial.push(extractor(Object.assign(Object.assign({}, ctx), { partial })));
            }
            return partial;
        };
        case 'ArithmeticExpression': return (function () {
            // binary expression (a + b)
            if (args.length === 3) {
                const [a, op, b] = args;
                return tag((context) => {
                    return op(context)(a, b);
                }, coalecenseTypes(a, b));
            }
            // unary expression (-b)
            if (args.length === 2) {
                const [op, value] = args;
                return tag((context) => {
                    return op(context)(() => 0, value);
                }, value.type);
            }
        })();
        case 'PositiveUnaryTest': return (context) => {
            // ensure that we strictly compare boolean values
            // with the implicit context value, if we match a unary test
            if (args[0].type === 'boolean' && has(context, '?')) {
                return args[0](context) === context['?'];
            }
            return args[0](context);
        };
        case 'ParenthesizedExpression': return args[1];
        case 'PathExpression': return tag((context) => {
            const pathTarget = args[0](context);
            const pathProp = args[1];
            if (isArray(pathTarget)) {
                return pathTarget.map(value => pathProp(value, true));
            }
            else {
                return pathProp(pathTarget, true);
            }
        }, 'any');
        // expression !filter "[" expression "]"
        case 'FilterExpression': return tag((context) => {
            const target = args[0](context);
            const filterFn = args[2];
            const filterTarget = isArray(target) ? target : [target];
            // null[..]
            if (target === null) {
                return null;
            }
            const type = filterFn.type;
            // a[1]
            // a[true]
            // a[b]
            // a[b()]
            // a[1 + 3]
            if (['number', 'boolean', 'any'].includes(type)) {
                const idx = filterFn(context);
                if (isBoolean(idx)) {
                    if (idx === true) {
                        return target;
                    }
                    else {
                        return [];
                    }
                }
                if (!isNumber(idx)) {
                    return [];
                }
                const value = filterTarget[idx < 0 ? filterTarget.length + idx : idx - 1];
                if (typeof value === 'undefined') {
                    return null;
                }
                else {
                    return value;
                }
            }
            // TODO(nikku): not covered by spec
            // a["attr"]
            if (type === 'string') {
                const value = filterFn(context);
                return filterTarget.filter(el => el === value);
            }
            // a[b=c]
            // a[>10]
            if (type === 'test') {
                return filterTarget.map(el => {
                    const iterationContext = Object.assign(Object.assign(Object.assign({}, context), { item: el }), el);
                    let result = filterFn(iterationContext);
                    // test is fn(val) => boolean SimpleUnaryTest
                    if (typeof result === 'function') {
                        result = result(el);
                    }
                    if (result instanceof Range) {
                        result = result.includes(el);
                    }
                    if (result === true) {
                        return el;
                    }
                    return result;
                }).filter(isTruthy);
            }
            // a[null]
            // a[@"2026-12-12"]
            return null;
        }, 'any');
        case 'SimplePositiveUnaryTest': return tag((context) => {
            // <Interval>
            if (args.length === 1) {
                return args[0](context);
            }
            // <CompareOp> <Expr>
            return args[0](context)(args[1](context));
        }, 'test');
        case 'List': return (context) => {
            return args.slice(1, -1).map(arg => arg(context));
        };
        case 'Interval': return tag((context) => {
            const left = args[1](context);
            const right = args[2](context);
            const startIncluded = left !== null && args[0] === '[';
            const endIncluded = right !== null && args[3] === ']';
            return createRange(left, right, startIncluded, endIncluded);
        }, 'test');
        case 'PositiveUnaryTests':
        case 'Expressions': return (context) => {
            return args.map(a => a(context));
        };
        case 'Expression': return (context) => {
            return args[0](context);
        };
        case 'UnaryTests': return (context) => {
            return (value = null) => {
                const negate = args[0] === 'not';
                const tests = negate ? args.slice(2, -1) : args;
                const matches = tests.map(test => test(context)).flat(1).map(test => {
                    if (isArray(test)) {
                        return test.includes(value);
                    }
                    if (typeof test === 'boolean') {
                        return test;
                    }
                    return compareValue(test, value);
                }).some(v => v === true);
                return matches === null ? null : (negate ? !matches : matches);
            };
        };
        default: return node.name;
    }
}
function getBuiltin(name, _context) {
    return getFromContext(name, builtins);
}
function extractValue(context, prop, _target) {
    const target = _target(context);
    if (['list', 'range'].includes(getType(target))) {
        return target.map(t => ({ [prop]: t }));
    }
    return null;
}
function compareIn(value, tests) {
    if (!isArray(tests)) {
        if (getType(tests) === 'nil') {
            return null;
        }
        tests = [tests];
    }
    return tests.some(test => compareValue(test, value));
}
function compareValue(test, value) {
    if (typeof test === 'function') {
        return test(value);
    }
    if (test instanceof Range) {
        return test.includes(value);
    }
    return equals(test, value);
}
const chars = Array.from('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
function isTyped(type, values) {
    return (values.some(e => getType(e) === type) &&
        values.every(e => e === null || getType(e) === type));
}
const nullRange = new Range({
    start: null,
    end: null,
    'start included': false,
    'end included': false,
    map() {
        return [];
    },
    includes() {
        return null;
    }
});
function createRange(start, end, startIncluded = true, endIncluded = true) {
    if (isTyped('string', [start, end])) {
        return createStringRange(start, end, startIncluded, endIncluded);
    }
    if (isTyped('number', [start, end])) {
        return createNumberRange(start, end, startIncluded, endIncluded);
    }
    if (isTyped('duration', [start, end])) {
        return createDurationRange(start, end, startIncluded, endIncluded);
    }
    if (isTyped('time', [start, end])) {
        return createDateTimeRange(start, end, startIncluded, endIncluded);
    }
    if (isTyped('date time', [start, end])) {
        return createDateTimeRange(start, end, startIncluded, endIncluded);
    }
    if (isTyped('date', [start, end])) {
        return createDateTimeRange(start, end, startIncluded, endIncluded);
    }
    if (start === null && end === null) {
        return nullRange;
    }
    throw new Error(`unsupported range: ${start}..${end}`);
}
function noopMap() {
    return () => {
        throw new Error('unsupported range operation: map');
    };
}
function valuesMap(values) {
    return (fn) => values.map(fn);
}
function valuesIncludes(values) {
    return (value) => values.includes(value);
}
function numberMap(start, end, startIncluded, endIncluded) {
    const direction = start > end ? -1 : 1;
    return (fn) => {
        const result = [];
        for (let i = start;; i += direction) {
            if (i === 0 && !startIncluded) {
                continue;
            }
            if (i === end && !endIncluded) {
                break;
            }
            result.push(fn(i));
            if (i === end) {
                break;
            }
        }
        return result;
    };
}
function includesStart(n, inclusive) {
    if (inclusive) {
        return (value) => n <= value;
    }
    else {
        return (value) => n < value;
    }
}
function includesEnd(n, inclusive) {
    if (inclusive) {
        return (value) => n >= value;
    }
    else {
        return (value) => n > value;
    }
}
function anyIncludes(start, end, startIncluded, endIncluded, conversion = (v) => v) {
    let tests = [];
    if (start === null && end === null) {
        return () => null;
    }
    if (start !== null && end !== null) {
        if (start > end) {
            tests = [
                includesStart(end, endIncluded),
                includesEnd(start, startIncluded)
            ];
        }
        else {
            tests = [
                includesStart(start, startIncluded),
                includesEnd(end, endIncluded)
            ];
        }
    }
    else if (end !== null) {
        tests = [
            includesEnd(end, endIncluded)
        ];
    }
    else if (start !== null) {
        tests = [
            includesStart(start, startIncluded)
        ];
    }
    return (value) => value === null ? null : tests.every(t => t(conversion(value)));
}
function createStringRange(start, end, startIncluded = true, endIncluded = true) {
    const singleStartChar = start !== null && chars.includes(start);
    const singleEndChar = end !== null && chars.includes(end);
    let values;
    if (singleStartChar && singleEndChar) {
        let startIdx = chars.indexOf(start);
        let endIdx = chars.indexOf(end);
        const direction = startIdx > endIdx ? -1 : 1;
        if (startIncluded === false) {
            startIdx += direction;
        }
        if (endIncluded === false) {
            endIdx -= direction;
        }
        values = chars.slice(startIdx, endIdx + 1);
    }
    const map = values ? valuesMap(values) : noopMap();
    const includes = values ? valuesIncludes(values) : anyIncludes(start, end, startIncluded, endIncluded);
    return new Range({
        start,
        end,
        'start included': startIncluded,
        'end included': endIncluded,
        map,
        includes
    });
}
function createNumberRange(start, end, startIncluded, endIncluded) {
    const map = start !== null && end !== null ? numberMap(start, end, startIncluded, endIncluded) : noopMap();
    const includes = anyIncludes(start, end, startIncluded, endIncluded);
    return new Range({
        start,
        end,
        'start included': startIncluded,
        'end included': endIncluded,
        map,
        includes
    });
}
/**
 * @param {Duration} start
 * @param {Duration} end
 * @param {boolean} startIncluded
 * @param {boolean} endIncluded
 */
function createDurationRange(start, end, startIncluded, endIncluded) {
    const toMillis = (d) => d ? Duration.fromDurationLike(d).toMillis() : null;
    const map = noopMap();
    const includes = anyIncludes(toMillis(start), toMillis(end), startIncluded, endIncluded, toMillis);
    return new Range({
        start,
        end,
        'start included': startIncluded,
        'end included': endIncluded,
        map,
        includes
    });
}
function createDateTimeRange(start, end, startIncluded, endIncluded) {
    const map = noopMap();
    const includes = anyIncludes(start, end, startIncluded, endIncluded);
    return new Range({
        start,
        end,
        'start included': startIncluded,
        'end included': endIncluded,
        map,
        includes
    });
}
function coalecenseTypes(a, b) {
    if (!b) {
        return a.type;
    }
    if (a.type === b.type) {
        return a.type;
    }
    return 'any';
}
function tag(fn, type) {
    return Object.assign(fn, {
        type,
        toString() {
            return `TaggedFunction[${type}] ${Function.prototype.toString.call(fn)}`;
        }
    });
}
function isTruthy(obj) {
    return obj !== false && obj !== null;
}
/**
 * @param {Function} fn
 * @param {string[]} [parameterNames]
 *
 * @return {FunctionWrapper}
 */
function wrapFunction(fn, parameterNames = null) {
    if (!fn) {
        return null;
    }
    if (fn instanceof FunctionWrapper) {
        return fn;
    }
    if (fn instanceof Range) {
        return new FunctionWrapper((value) => fn.includes(value), ['value']);
    }
    if (typeof fn !== 'function') {
        return null;
    }
    return new FunctionWrapper(fn, parameterNames || parseParameterNames(fn));
}
function parseString(str) {
    if (str.startsWith('"')) {
        str = str.slice(1);
    }
    if (str.endsWith('"')) {
        str = str.slice(0, -1);
    }
    return str.replace(/(\\")|(\\\\)|(\\n)|(\\r)|(\\t)|(\\u[a-fA-F0-9]{5,6})|((?:\\u[a-fA-F0-9]{1,4})+)/ig, function (substring, ...groups) {
        const [quotes, backslash, newline, carriageReturn, tab, codePoint, charCodes] = groups;
        if (quotes) {
            return '"';
        }
        if (newline) {
            return '\n';
        }
        if (carriageReturn) {
            return '\r';
        }
        if (tab) {
            return '\t';
        }
        if (backslash) {
            return '\\';
        }
        const escapePattern = /\\u([a-fA-F0-9]+)/ig;
        if (codePoint) {
            const codePointMatch = escapePattern.exec(codePoint);
            return String.fromCodePoint(parseInt(codePointMatch[1], 16));
        }
        if (charCodes) {
            const chars = [];
            let charCodeMatch;
            while ((charCodeMatch = escapePattern.exec(substring)) !== null) {
                chars.push(parseInt(charCodeMatch[1], 16));
            }
            return String.fromCharCode(...chars);
        }
        throw new Error('illegal match');
    });
}
function lintErrorDetails(errorNodeRef) {
    const node = errorNodeRef.node;
    const parent = node.parent;
    const { from, to } = node;
    if (node.from !== node.to) {
        return {
            message: `Unrecognized token in <${parent.name}>`,
            position: {
                from,
                to
            }
        };
    }
    const next = findNext(node);
    if (next) {
        return {
            message: `Unrecognized token <${next.name}> in <${parent.name}>`,
            position: {
                from: next.from,
                to: next.to
            }
        };
    }
    else {
        const unfinished = parent.enterUnfinishedNodesBefore(errorNodeRef.to);
        return {
            message: `Incomplete <${(unfinished || parent).name}>`,
            position: {
                from,
                to
            }
        };
    }
}
function lintError(input, errorNodeRef) {
    const { message, position } = lintErrorDetails(errorNodeRef);
    return new SyntaxError(message, {
        input: input.slice(position.from, position.to),
        position
    });
}
function findNext(nodeRef) {
    const node = nodeRef.node;
    let next, parent = node;
    do {
        next = parent.nextSibling;
        if (next) {
            return next;
        }
        parent = parent.parent;
    } while (parent);
    return null;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatValue(value) {
    const type = getType(value);
    if (type === 'string') {
        return `"${String(value)}"`;
    }
    if (type === 'list') {
        return `[${value.length} items]`;
    }
    if (type === 'context') {
        return '{...}';
    }
    if (type === 'function') {
        const parameterNames = value.parameterNames;
        if (parameterNames) {
            return `function(${parameterNames.join(', ')})`;
        }
        return 'function';
    }
    if (type === 'nil') {
        return 'null';
    }
    return String(value);
}

export { SyntaxError, date, duration, evaluate, parseExpression, parseUnaryTests, unaryTest };
//# sourceMappingURL=index.js.map
