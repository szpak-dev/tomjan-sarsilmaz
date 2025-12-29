/**
 * Get the base path for the current environment
 */
export function getBasePath(): string {
    return process.env.GITHUB_ACTIONS ? '/tomjan-sarsilmaz' : '';
}
