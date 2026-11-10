# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## 3.2.1 - 2023-08-31

### Fixed
- Translation was missing for paragraph used as heading text. #TINY-10053

## 3.2.0 - 2023-06-13

### Changed
- Updated the dropdown styles to match the default TinyMCE styles. #TINY-9630

### Fixed
- No longer allow attempting to fix a table's lack of headers if the table has no cells at all. #TINY-9753
- Element inside noneditable elements were not properly ignored. #TINY-9464

## 3.1.0 - 2022-11-23

### Added
- Added a new rule to show a warning when the alternative text of an image exceeds 100 characters. #TINY-9131

### Improved
- Added correct icons in dialog alert panel for each severity level. #TINY-9128
- Improved discoverability of the question mark read more link, removed border around the description, decreased title font size and improved title colour to meet contrast ratio. #TINY-9180

### Fixed
- Merge tags prefix and suffix elements were not ignored. #TINY-9361

## 3.0.3 - 2022-06-29

### Fixed
- Accessibility checker menu item did not have an ellipsis. #TINY-8433

## 3.0.1 - 2022-03-11

### Fixed
- The rule help urls were incorrectly pointing to the TinyMCE 5 documentation. #TINY-8559

## 3.0.0 - 2022-03-03

### Added
- Added translations for Hindi, Malay and Vietnamese. #TINY-8428

### Changed
- Changed the default value for `a11ychecker_html_version` to `html5`. #TINY-7824

### Fixed
- The text for some buttons, dialog fields and menu items were incorrectly using title-case. #TINY-7280

### Removed
- Removed support for TinyMCE 4.x and TinyMCE 5.x. #TINY-8244
- Removed support for Microsoft Internet Explorer. #TINY-8245

## 2.3.2 - 2021-05-06

### Fixed
- Fixed an issue where the ordered list structure rule was not enforced when list items were separated by `br` elements. #TINY-6557
- Fixed an issue where adjacent links were not detected when separated by zero-width unicode characters. #TINY-6553
- Fixed an issue that could cause paragraphs that were used as headings to not be detected. #TINY-6602
- Fixed documentation URLs to point to new page location. #DOC-703
- Fixed dialog button text incorrectly using title-style capitalization. #TINY-6816

## 2.3.1 - 2020-11-18

### Fixed
- Fixed an issue where internal TinyMCE elements were not ignored. #TINY-4877

## 2.3.0 - 2020-10-06

### Added
- Added the `a11ychecker_ignored_rules` setting to allow filtering of rules by rule ID. #TINY-6265
- Added the `a11ychecker_issue_url_callback` setting to allow custom URLs to be used for the more info links. #TINY-6198
- Added rule `id` to the rule data returned by the `getReport()` API method. #TINY-6265
- Added the `a11ychecker_filter_issues` setting to allow filtering of report results. #TINY-6266

### Fixed
- Fixed the `toggleAudit` API not accounting for the dialog being closed by dialog buttons or the ESC key. #TINY-6384
- Fixed the error message displayed when the filename of an image clashes with the alt text. #TINY-6431
- Fixed missing `bg_BG`, `eu` and `id` translations. #TINY-6374
- Fixed the editor content scrolling when calling the `getReport` API. #TINY-6439
- Fixed incorrect strings used for the next/previous button tooltips. #TINY-6437
- Fixed a security issue related to repairing table captions. #TINY-6510

## 2.2.1 - 2020-06-09

### Fixed
- Fixed missing translations for strings added in 2.2.0. #TINY-6056

## 2.2.0 - 2020-02-13

### Added
- Added a rule to ensure that ID attributes on elements are unique in a document. #FOAM-11
- Added image alt text support to allow users to specify if an image is decorative or informative. #FOAM-10
- Changed image alt text rules to make the requirements for passing the image alt text checks stricter. #FOAM-10

### Fixed
- Fixed incorrect language codes being used for translations. #TINY-4203

## 2.1.0 - 2019-08-19

### Added
- Changed the layout of the dialog. #TINY-3305
- Added a `a11ychecker_level` setting to allow filtering of rules by WCAG level. #TINY-3731
- Added a `a11ychecker_html_version` setting to allow filtering of rules by HTML version. #TINY-3731

## 2.0.3 - 2019-05-21

### Fixed
- Fixed bug where an empty src attribute on an image would produce a js error. #TINY-3605

## 2.0.2 - 2019-03-19

### Fixed
- Fixed the `getReport` and `toggleaudit` apis not being exposed in v2. #TINY-3471

## 2.0.1 - 2019-03-04

### Fixed
- Fixed accessibility issues with the TinyMCE 5.0 dialog. #TINY-2694

## 1.2.1 - 2018-03-01

### Added
- Added a `a11ychecker_allow_decorative_images` setting to allow images with a `alt=""` and `role="presentation"`. #TINY-1457

## 1.2.0 - 2018-02-01

### Added
- Decreased plugin size by improving build steps.

## 1.1.0 - 2017-12-11

### Added
- Exposed API method getReport() - a way to run a11y check without triggering the repair wizard.

## 1.0.6 - 2017-05-23

### Fixed
- Added language packs for a bunch of languages. #TINY-1379

## 1.0.5 - 2017-05-23

### Fixed
- Fixed bug where it wasn't possible to open specification details link using keyboard navigation. #TINY-1052

## 1.0.4 - 2017-04-03

### Fixed
- Fixed bug where clicking the "No accessibility issues detected" text opened an empty browser window. #TINY-956

## 1.0.3 - 2017-02-01

### Fixed
- Fixed bug where the a11y toolbar wasn't positioned correctly in inline mode on scroll. #TINY-763

## 1.0.2 - 2016-10-27

### Improved
- Added version detection logic that checks if this plugin is used with a compatible tinymce version. #TINY-639

### Fixed
- Fixed bug where contrast warning messages wasn't properly rendered. #TINY-648
