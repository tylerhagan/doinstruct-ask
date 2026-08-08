// Fully static. No server, no cold start, no runtime dependency.
// The whole app is cacheable and can be served from a CDN edge or, in a plant
// with poor connectivity, from a local cache after first load.
export const prerender = true;
export const ssr = true;
