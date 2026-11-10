# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## 1.2.0 - 2023-08-31

### Improved
- Added new boolean option `tableofcontents_includeheader` to control whether a header is included in the table of contents. Defaults to true. #TINY-9970
- Added new boolean option `tableofcontents_orderedlist` to use ordered lists instead of unordered lists in the table of contents. #TINY-9968
- Added new option `tableofcontents_orderedlist_type` to set a specific type of ordered list, defaulting to a numeric ordered list. #TINY-9969

### Fixed
- ToC toolbar button and menu item are now disabled when the selection is not editable #TINY-9890
- Empty headers would be included in table of content. #TINY-9862
- Changes to the ToC title were overwritten using the update button. #TINY-9971

## 1.1.0 - 2022-06-29

### Changed
- An internal `data-mce-toc` attribute is now added to the Table of Contents wrapper `div` while editing #TINY-8698

## 1.0.0 - 2022-03-03

### Added
- Initial release
