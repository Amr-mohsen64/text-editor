# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## 2.0.2 - 2023-06-13

### Fixed
- It was possible to alter text in non-editable sections using formatpainter #TINY-9472

## 2.0.0 - 2022-03-03

### Added
- Added `formatpainter` menu item to match the toolbar button #TINY-8141

### Changed
- Renamed the `formatpainter_blacklisted_formats` option to `formatpainter_ignored_formats` #TINY-8102

### Fixed
- The text on some buttons and menu items were incorrectly using title-case #TINY-7280

### Removed
- Removed support for TinyMCE 4.x and TinyMCE 5.x #TINY-8244
- Removed support for Microsoft Internet Explorer #TINY-8245

## 1.2.0 - 2019-10-25

### Added
- Added a new format registered by the format painter for legacy font-elements #FOPA-28
- Added support for painting on touch devices #FOPA-27

## 1.1.0 - 2019-03-28

### Added
- Added checklist and liststyletype format registration #FOPA-7

### Changed
- Changed so that formats registered by the format painter are namespaced with a prefix #FOPA-25

### Fixed
- Fixed an issue that made the format painter too lenient when matching/reading formats #FOPA-23
- Fixed an issue where applying formats with keyboard shortcut would toggle off the format painter #FOPA-22
- Fixed an issue where formats with selectors would be handled incorrectly #FOPA-22

## 1.0.0 - 2019-01-07

### Added
- Initial release
