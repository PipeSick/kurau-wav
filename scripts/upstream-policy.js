function isStableTag(tag) {
    return /^v\d+\.\d+\.\d+$/.test(tag);
}

function compareStableTags(a, b) {
    const pa = a.replace(/^v/, '').split('.').map(Number);
    const pb = b.replace(/^v/, '').split('.').map(Number);
    for (let index = 0; index < 3; index += 1) {
        if (pa[index] !== pb[index]) return pa[index] - pb[index];
    }
    return 0;
}

function latestStableTag(tags) {
    return tags
        .filter(isStableTag)
        .sort(compareStableTags)
        .at(-1) || null;
}

function shouldPrepareUpdate(baseTag, candidateTag) {
    if (!isStableTag(baseTag) || !isStableTag(candidateTag)) return false;
    return compareStableTags(candidateTag, baseTag) > 0;
}

module.exports = {
    compareStableTags,
    isStableTag,
    latestStableTag,
    shouldPrepareUpdate,
};
