export function strictEqual(actual, expected, message) {
    if (actual !== expected) {
        var details = 'Expected "' + expected + '" but got "' + actual + '".';
        if (message) {
            details += ' ' + message;
        }
        throw new Error(details);
    }
}
