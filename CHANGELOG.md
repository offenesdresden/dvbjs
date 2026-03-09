# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 7.0.0 - 2026-03-09

### Breaking Changes

- Dropped Node.js 18 support; requires Node.js 20+
- Removed `coords()` function — use `findStop()` which already returns coordinates
- Renamed all public interfaces: dropped `I` prefix (e.g. `IMonitor` → `Monitor`, `IRoute` → `Route`)
- Tightened `coord` type from `number[]` to `[number, number]` tuple
- `pins()` now throws on API errors instead of silently returning an empty array

### Changed

- Replaced axios with native `fetch`
- Migrated all endpoints to VVO WebAPI
- Switched to async/await throughout
- Eliminated all `any` types; fully typed API responses
- ESM-first package with dual ESM/CJS output via tsdown
- Replaced ESLint + Prettier with Biome
- Replaced Mocha + Chai with Vitest
- Flattened monorepo to single package

### Removed

- `coords()` function
- axios dependency
- ESLint, Prettier, Mocha, Chai, Karma, nyc, and related dependencies

## 6.0.0 - 2019-10-07

### Added

- timeout parameter for all functions

### Changed

- mode is optional in all types
- icon_url of IMode is renamed to iconUrl
- platform_nr is renamed to platformNr (used by platform pins)
- default timeout of routes increased from 5s to 15s
