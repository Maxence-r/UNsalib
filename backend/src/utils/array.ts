// Checks if two arrays are the same
// Adapted from https://stackoverflow.com/a/16436975
function areArraysEqual<T>(a: T[], b: T[]): boolean {
    if (a === b) return true;
    if (!a || !b) return false;
    if (a.length !== b.length) return false;

    const aSorted = a.sort();
    const bSorted = b.sort();

    for (let i = 0; i < aSorted.length; i++) {
        if (aSorted[i] !== bSorted[i]) return false;
    }
    return true;
}

export { areArraysEqual };
