// Picks the data source: EXPO_PUBLIC_DATA_SOURCE = "mock" (default) or "http".
import { httpRepositories } from './http';
import { mockRepositories } from './mock';
import type { Repositories } from './repositories';

export const dataSource: 'mock' | 'http' = process.env.EXPO_PUBLIC_DATA_SOURCE === 'http' ? 'http' : 'mock';

export const repos: Repositories = dataSource === 'http' ? httpRepositories : mockRepositories;

export * from './repositories';
