export function isServerlessOffline() {
    return process.env.IS_OFFLINE === 'true';
}
