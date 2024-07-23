'use strict';

const formatCurrency = (num, precision = 2) => {
    const map = [
        { suffix: 'B', threshold: 1e9 },
        { suffix: 'M', threshold: 1e6 },
        { suffix: 'K', threshold: 1e3 },
        { suffix: '', threshold: 1 },
    ];

    const found = map.find((x) => Math.abs(num) >= x.threshold);

    if (found) {
        const formatted = (num / found.threshold).toFixed(precision) + found.suffix;
        return formatted;
    }

    return num;
}

const replaceAll = (strReplace, strWith) => {
    // See http://stackoverflow.com/a/3561711/556609
    var esc = strReplace.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    var reg = new RegExp(esc, 'ig');
    return strReplace.replace(reg, strWith);
};

module.exports = { formatCurrency, replaceAll };