/**
 * Links out to the hosted account portal.
 *
 * The portal is a separate application on its own domain, so these links are
 * always absolute and always open in a new tab, leaving the current session in
 * place.
 *
 * `suffix` is appended to the portal root, so it can be a path (`/storage`) or
 * a query string (`?changePlan`).
 *
 * Kept deliberately identical to web/src/lib/utils/privohub.ts in the Immich
 * fork: Photos and Drive send customers to the same two destinations, and a
 * drift between them would mean the same button lands somewhere else depending
 * on which app it was pressed in.
 */
const PORTAL_URL = 'https://privohub.com/portal'

export const portalUrl = (suffix = '') => `${PORTAL_URL}${suffix}`
