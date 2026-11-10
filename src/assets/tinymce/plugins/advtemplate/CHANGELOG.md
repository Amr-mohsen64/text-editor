# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## 1.3.0 - 2023-08-31

### Added
- New `AdvTemplateInsertTemplateById` command to insert the template specified by its `id` property value. #TINY-9976
- New `{{mce-cursor}}` marker to indicate the cursor position after the template is inserted. #TINY-9973

## 1.2.0 - 2023-06-13

### Added
- New `advtemplate_templates` configuration option to define an immutable list of predefined templates. #TINY-9755

### Improved
- The plugin's UI has been enhanced to provide controls only for a preconfigured set of operations. #TINY-9756

### Fixed
- The insert template button and menu item was not disabled when the selection was in a non-editable context. #TINY-9892
- The category items would not stay expanded after their templates were renamed in the tree component of the Templates dialog. #TINY-9691
- The currently selected tree component template item would not stay highlighted after the Templates dialog redialing. #TINY-9770
- The destination category list would include the template's own category in the "Move template" dialog. #TINY-9774

## 1.1.0 - 2023-03-29

### Improved
- The dialog for renaming the category/template is now prefilled with the previous name. #TINY-9728

## 1.0.0 - 2023-03-16

### Added
- Initial release
