# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## 1.1.2 - 2023-06-13

### Fixed
- Typography buttons are disabled in non-editable sections of the editor. #TINY-9468
- Typography command no longer applies fixes if the selection is non-editable. #TINY-9468

## 1.1.0 - 2023-03-16

### Added
- Added `common/space/delBetweenExclamationMarks` to remove spaces between exclamation marks. #TINY-9398
- Added typography plugin to the default menubar. #TINY-9450

### Improved
- Typography button and menu item will be disabled if editor has no content. #TINY-9441

### Fixed
- Spaces after opening and before closing quotes are not added anymore in French. #TINY-9434
- Fixed adding redundant space between a comma and a quote by switching the sequence of executing safe and unsafe rules. #TINY-9442
- Fixed adding unnecessary space after a comma and before a quote in several scenarios. #TINY-9510

## 1.0.1 - 2022-12-06

### Fixed
- Punctuation marks after § symbol are no longer removed. #TINY-9388
- Typography now ignores the `lang` attribute on the editor root element. #TINY-9413
- Selecting Czech language does not throw error anymore. #TINY-9397

## 1.0.0 - 2022-11-23

### Added
- Initial release
