# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## 3.0.3 - 2023-06-13

### Fixed
- Fixed link checking being performed on links in non-editable context #TINY-9478

## 3.0.0 - 2022-03-03

### Added
- Added new `linkchecker_preprocess` function to allow links to be adjusted before link checking #LIN-3

### Removed
- Removed support for TinyMCE 4.x and TinyMCE 5.x #TINY-8244
- Removed support for Microsoft Internet Explorer #TINY-8245

## 2.0.3 - 2019-06-07

### Fixed
- Fixed link checking being performed incorrectly on empty links #TINY-3654

## 2.0.2 - 2019-04-29

### Improved
- Improved screen reader accessibility and added "ignore invalid link" status #TINY-2329

### Changed
- Changed error messages to display in the console instead of the UI #TINY-3593
- Marked local links as `unknown` instead of `invalid`

### Fixed
- Fixed repeating context menu items #TINY-3543

## 2.0.0 - 2019-02-04

### Added
- Support for TinyMCE 5

## 1.1.1 - 2018-05-16

### Fixed
- Fixed bug where the link context menu wasn't working #TINY-1680

## 1.1.0 - 2018-02-01

### Improved
- Decreased plugin size by improving build steps

## 1.0.5 - 2017-12-08

### Fixed
- Fixed issue where it would use a direct reference to the menu control instead of using the ui factory

## 1.0.4 - 2017-06-13

### Fixed
- Fixed so that the error messages are more human readable #TINY-1077

## 1.0.3 - 2017-05-04

### Fixed
- Fixed bug where anchor links were highlighted as invalid, they are now ignored by the checker #TINY-997

## 1.0.2 - 2017-04-03

### Added
- Added inline tooltip to show more info when a link does not seem to be valid #TINY-944

## 1.0.1 - 2017-03-01

### Fixed
- Fixed web url normalization #TINY-922

## 1.0.0 - 2017-01-11

### Added
- Initial release
