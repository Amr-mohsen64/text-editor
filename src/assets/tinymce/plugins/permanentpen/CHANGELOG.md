# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## 2.1.0 - 2023-06-13

### Changed
- Updated the `font` and `fontsize` dropdown styles to match the default TinyMCE styles #TINY-9630

## 2.0.2 - 2022-09-08

### Fixed
- Fixed an issue where permanent pen wouldn't turn off correctly if the next action was an enter keypress #TINY-8835

## 2.0.0 - 2022-03-03

### Removed
- Removed support for TinyMCE 5.x #TINY-8244
- Removed support for Microsoft Internet Explorer #TINY-8245

## 1.1.0 - 2020-02-13

### Added
- Added a `PermanentPenProperties` event #PEPE-19
- Added some initial support for use with IMEs #PEPE-33

### Changed
- Updated error message for incorrect configuration #PEPE-28
- Updated permanent pen to apply the format after content is inserted instead of overriding inserting content #PEPE-33

### Fixed
- Fixed an issue where permanent pen wouldn't clear the current format after toggling off #PEPE-30

## 1.0.0 - 2019-01-10

### Added
- Initial release
