# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## 2.1.0 - 2023-06-13

### Changed
- Updated the `advanced sort` dropdown styles to match the default TinyMCE styles #TINY-9630

## 2.0.2 - 2022-11-23

### Fixed
- The Advanced Sorting dialog would not correctly switch from row to column in the sort field when the sortby field was changed. #TINY-9191

## 2.0.0 - 2022-03-03

### Added
- Added translations for Hindi, Malay and Vietnamese #TINY-8428

### Changed
- The `advtable` plugin now only requires the `table` plugin to be enabled for the UI components #TINY-8504

### Fixed
- The `getRowType` function would sometimes not correctly handle headers in the `tfoot` section #TINY-8104
- Tables containing a `colgroup` would not be sorted correctly #TINY-7043

### Removed
- Removed support for TinyMCE 5.x #TINY-8244
- Removed support for Microsoft Internet Explorer #TINY-8245

## 1.2.0 - 2021-10-11

### Added
- Added `getRowType` and `getColType` properties to the series generator `info` argument #TINY-7970

### Fixed
- Toggling a series column would remove any other locked columns #TINY-7778
- The selection could be placed in an invalid location when a series column was updated #TINY-7911

## 1.1.0 - 2021-08-27

### Added
- Added new series column feature #TINY-6005

### Changed
- Moved the translations from core #TINY-7430

### Fixed
- Prevent sorting of locked column cells when sorting by row #TINY-7693

## 1.0.2 - 2021-02-09

### Fixed
- Fixed an issue where the `TableModified` event was not fired when sorting a table #TINY-6642

## 1.0.1 - 2020-10-09

### Fixed
- Fixed compatibility issue with TinyMCE 5.5 or higher #TINY-6492

## 1.0.0 - 2019-11-29

### Added
- Initial release
