import { createClient } from 'microcms-js-sdk';

export const client = createClient({
    serviceDomain: 'portfolio202201',
    apiKey: process.env.API_KEY,
});