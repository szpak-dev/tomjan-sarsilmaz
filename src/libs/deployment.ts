export function getBasePath(): string {
    return process.env.GITHUB_ACTIONS ? '/tomjan-sarsilmaz' : '';
}
