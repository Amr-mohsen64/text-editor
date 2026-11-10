# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## 3.1.3 - 2023-09-01

### Fixed
- Automatic media embed would not work as expected if the link was pasted into a `div` element. #TINY-10060

## 3.1.2 - 2023-06-13

### Fixed
- Wrap embed code with a div, move `max-width` to outer container to maintain the embed element in a correct aspect ratio. #TINY-8714

## 3.0.4 - 2022-09-08

### Fixed
- Added `min-width: 100px` to audio elements so that they would still show if aligned left or right. #TINY-8687

## 3.0.3 - 2022-06-29

### Fixed
- Console warnings would incorrectly be logged when not using the `media` plugin #TINY-7375

## 3.0.0 - 2022-03-03

### Removed
- Removed support for TinyMCE 4.x and TinyMCE 5.x #TINY-8244
- Removed support for Microsoft Internet Explorer #TINY-8245
- Removed support for the deprecated `false` value for the `forced_root_block` option #TINY-8412

## 2.2.6 - 2021-11-03

### Fixed
- Fixed the `mediaembed` content CSS loading incorrectly, which caused it to not display in previews #TINY-7511

## 2.2.5 - 2020-01-28

### Fixed
- Fixed `mediaembed_max_width` setting not working on IE 11 #EME-45

## 2.2.4 - 2019-11-05

### Fixed
- Added touch event listener to embeds for mobile #TINY-4093

## 2.2.3 - 2019-08-08

### Fixed
- Fixed urls failing to get converted on Firefox when pressing enter #EME-42

## 2.2.2 - 2019-06-24

### Fixed
- Fixed service errors not showing a visible error message when using the media plugin dialog #TINY-3792

## 2.2.1 - 2019-06-06

### Fixed
- Fixed multiple links in the same paragraph being converted when only the last link in the paragraph should have been #EME-33

## 2.2.0 - 2019-05-24

### Added
- Added a new setting `mediaembed_inline_styles` that inlines CSS for the embedded summary cards #EME-32

## 2.1.0 - 2019-05-17

### Changed
- Changed service errors to log in the console, instead of display as notifications. #TINY-3645

## 2.0.0 - 2019-02-04

### Added
- Support for TinyMCE 5

## 1.1.0 - 2018-02-01

### Improved
- Decreased plugin size by improving build steps.

## 1.0.3 - 2017-12-08

### Fixed
- Fixed so more strict CSP rules can be used for this plugin. #TINY-1397

## 1.0.2 - 2017-06-13

### Fixed
- Fixed so that the error messages are more human readable. #TINY-1077

## 1.0.1 - 2017-05-23

### Fixed
- Fixed bug where the AsYouType functionality did not work with forced_root_block set to false. #TINY-1030

## 1.0.0 - 2017-01-11

### Added
- Initial release
