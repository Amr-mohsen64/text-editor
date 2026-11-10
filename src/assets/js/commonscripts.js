$j(document).ready(function(){
  $j('[data-toggle="popover"]').popover();
});

// function collapsePanels (ButtonCollapseId, PanelCollapseId){
//
//   $j("#" + ButtonCollapseId).click(function() {
//     $j("#" + PanelCollapseId).collapse('toggle');
//   });
//
//   $j("#" + PanelCollapseId).on('show.bs.collapse', function() {
//     $j("#" + ButtonCollapseId).parent().parent().parent().removeClass('panel-default');
//     $j("#" + ButtonCollapseId).parent().parent().parent().addClass('panel-primary');
//   });
//
//   $j("#" + PanelCollapseId).on('hide.bs.collapse', function() {
//     $j("#" + ButtonCollapseId).parent().parent().parent().removeClass('panel-primary');
//     $j("#" + ButtonCollapseId).parent().parent().parent().addClass('panel-default');
//   });
//
// }

// collapsePanels("buttonCollapseOne", "collapseOne");
// collapsePanels("buttonCollapseTwo", "collapseTwo");
// collapsePanels("buttonCollapseThree", "collapseThree");
// collapsePanels("buttonCollapseFour", "collapseFour");
// collapsePanels("buttonCollapseFive", "collapseFive");
// collapsePanels("buttonCollapseSix", "collapseSix");

$j(".tab-header").click(function(){
  if ( $j(this).hasClass('tab-header-active') ){
  }else{
    $j(".tab-header").removeClass('tab-header-active');
    $j(this).addClass('tab-header-active');
  }
});

$j("label.calendar").click(function(){
  toggleDatepickerVisibility(this.parentElement.nextElementSibling.id);
});

$j("#date-1 .tab-gregorian").click(function(){
  if ( $j(this).hasClass('active') ){

  } else {
    $j('#date-1 .tab').removeClass('active');
    $j(this).addClass('active');
    $j('#date-1 .hijri').hide();
    $j('#date-1 .gregorian').show();
    $j('#date-1 > .tab-hijri > .btn2').hide();
    $j('#date-1 > .tab-hijri > .btn1').show();
    $j('#date-1 > .tab-gregorian > .btn2').show();
    $j('#date-1 > .tab-gregorian > .btn1').hide();
  }
});

$j("#date-1 .tab-hijri").click(function(){
  if ( $j(this).hasClass('active') ){

  } else {
    $j('#date-1 .tab').removeClass('active');
    $j(this).addClass('active');
    $j('#date-1 .gregorian').hide();
    $j('#date-1 .hijri').show();
    $j('#date-1 > .tab-gregorian > .btn2').hide();
    $j('#date-1 > .tab-gregorian > .btn1').show();
    $j('#date-1 > .tab-hijri > .btn2').show();
    $j('#date-1 > .tab-hijri > .btn1').hide();
  }
});

$j("#date-2 .tab-gregorian").click(function(){
  if ( $j(this).hasClass('active') ){

  } else {
    $j('#date-2 .tab').removeClass('active');
    $j(this).addClass('active');
    $j('#date-2 .hijri').hide();
    $j('#date-2 .gregorian').show();
  }
});

$j("#date-2 .tab-hijri").click(function(){
  if ( $j(this).hasClass('active') ){

  } else {
    $j('#date-2 .tab').removeClass('active');
    $j(this).addClass('active');
    $j('#date-2 .gregorian').hide();
    $j('#date-2 .hijri').show();
  }
});

$j('#gregorian_datepicker_placeholder').calendarsPicker({
  calendar: $j.calendars.instance(), // The calendar to use
  prevText: '<i class="fa fa-angle-left" aria-hidden="true"></i>',
  nextText: '<i class="fa fa-angle-right" aria-hidden="true"></i>',
  pickerClass: 'calendar', // CSS class to add to this instance of the datepicker
  showOnFocus: true, // True for popup on focus, false for not
  showTrigger: null, // Element to be cloned for a trigger, null for none
  showAnim: '', // Name of jQuery animation for popup, '' for no animation
  showOptions: {}, // Options for enhanced animations
  showSpeed: 'normal', // Duration of display/closure
  popupContainer: null, // The element to which a popup calendar is added, null for body
  alignment: 'bottomLeft', // Alignment of popup - with nominated corner of input:
      // 'top' or 'bottom' aligns depending on language direction,
      // 'topLeft', 'topRight', 'bottomLeft', 'bottomRight'
  fixedWeeks: true, // True to always show 6 weeks, false to only show as many as are needed
  firstDay: null, // First day of the week, 0 = Sunday, 1 = Monday, ...
      // defaults to calendar local setting if null
  calculateWeek: null, // Calculate week of the year from a date, null for calendar default
  localNumbers: false, // True to localise numbers (if available),
      // false to use normal Arabic numerals
  monthsToShow: 1, // How many months to show, cols or [rows, cols]
  monthsOffset: 0, // How many months to offset the primary month by
  monthsToStep: 1, // How many months to move when prev/next clicked
  monthsToJump: 12, // How many months to move when large prev/next clicked
  changeMonth: true, // True to change month/year via drop-down, false for navigation only
  yearRange: 'c-10:c+10', // Range of years to show in drop-down: 'any' for direct text entry
      // or 'start:end', where start/end are '+-nn' for relative to today
      // or 'c+-nn' for relative to the currently selected date
      // or 'nnnn' for an absolute year
  showOtherMonths: true, // True to show dates from other months, false to not show them
  selectOtherMonths: false, // True to allow selection of dates from other months too
  defaultDate: null, // Date to show if no other selected
  selectDefaultDate: false, // True to pre-select the default date if no other is chosen
  minDate: null, // The minimum selectable date
  maxDate: null, // The maximum selectable date
  dateFormat: null, // Format for dates, defaults to calendar setting if null
  autoSize: false, // True to size the input field according to the date format
  rangeSelect: false, // Allows for selecting a date range on one date picker
  rangeSeparator: ' - ', // Text between two dates in a range
  multiSelect: 0, // Maximum number of selectable dates, zero for single select
  multiSeparator: ',', // Text between multiple dates
  onDate: null, // Callback as a date is added to the datepicker
  onShow: $j.calendarsPicker.hoverCallback(function() {
    $j('#gregorian_datepicker_placeholder a').hover(function() {
      $j(this).toggleClass('calendars-highlight');
    })
  }), // Callback just before a datepicker is shown
  onChangeMonthYear: null, // Callback when a new month/year is selected
  onSelect: function(dates) {
    var selected = dates[0].toJD();
    var hijri_date = $j.calendars.instance('islamic').fromJD(selected);
    $j('#hijri_datepicker_placeholder').calendarsPicker('setDate', hijri_date);
    $j('#date_field').val(dates[0].formatDate('YYYY-mm-dd'));
    // $j(".form-group .date-picker").toggleClass('calendar-open');
  }, // Callback when a date is selected
  onClose: null, // Callback when a datepicker is closed
  altField: null, // Alternate field to update in synch with the datepicker
  altFormat: null, // Date format for alternate field, defaults to dateFormat
  constrainInput: true, // True to constrain typed input to dateFormat allowed characters
  commandsAsDateFormat: false, // True to apply formatDate to the command texts
  commands: this.commands, // Command actions that may be added to a layout by name
  renderer: $j.calendarsPicker.weekOfYearRenderer,
});

$j('#hijri_datepicker_placeholder').calendarsPicker({
  calendar: $j.calendars.instance('islamic'), // The calendar to use
  prevText: '<i class="fa fa-angle-left" aria-hidden="true"></i>',
  nextText: '<i class="fa fa-angle-right" aria-hidden="true"></i>',
  pickerClass: '', // CSS class to add to this instance of the datepicker
  showOnFocus: true, // True for popup on focus, false for not
  showTrigger: null, // Element to be cloned for a trigger, null for none
  showAnim: '', // Name of jQuery animation for popup, '' for no animation
  showOptions: {}, // Options for enhanced animations
  showSpeed: 'normal', // Duration of display/closure
  popupContainer: null, // The element to which a popup calendar is added, null for body
  alignment: 'bottomLeft', // Alignment of popup - with nominated corner of input:
      // 'top' or 'bottom' aligns depending on language direction,
      // 'topLeft', 'topRight', 'bottomLeft', 'bottomRight'
  fixedWeeks: true, // True to always show 6 weeks, false to only show as many as are needed
  firstDay: null, // First day of the week, 0 = Sunday, 1 = Monday, ...
      // defaults to calendar local setting if null
  calculateWeek: null, // Calculate week of the year from a date, null for calendar default
  localNumbers: false, // True to localise numbers (if available),
      // false to use normal Arabic numerals
  monthsToShow: 1, // How many months to show, cols or [rows, cols]
  monthsOffset: 0, // How many months to offset the primary month by
  monthsToStep: 1, // How many months to move when prev/next clicked
  monthsToJump: 12, // How many months to move when large prev/next clicked
  changeMonth: true, // True to change month/year via drop-down, false for navigation only
  yearRange: 'c-10:c+10', // Range of years to show in drop-down: 'any' for direct text entry
      // or 'start:end', where start/end are '+-nn' for relative to today
      // or 'c+-nn' for relative to the currently selected date
      // or 'nnnn' for an absolute year
  showOtherMonths: true, // True to show dates from other months, false to not show them
  selectOtherMonths: false, // True to allow selection of dates from other months too
  defaultDate: null, // Date to show if no other selected
  selectDefaultDate: false, // True to pre-select the default date if no other is chosen
  minDate: null, // The minimum selectable date
  maxDate: null, // The maximum selectable date
  dateFormat: null, // Format for dates, defaults to calendar setting if null
  autoSize: false, // True to size the input field according to the date format
  rangeSelect: false, // Allows for selecting a date range on one date picker
  rangeSeparator: ' - ', // Text between two dates in a range
  multiSelect: 0, // Maximum number of selectable dates, zero for single select
  multiSeparator: ',', // Text between multiple dates
  onDate: null, // Callback as a date is added to the datepicker
  onShow: $j.calendarsPicker.hoverCallback(function() {
    $j('#hijri_datepicker_placeholder a').hover(function() {
      $j(this).toggleClass('calendars-highlight');
    })
  }), // Callback just before a datepicker is shown
  onChangeMonthYear: null, // Callback when a new month/year is selected
  onSelect: function(dates) {
    var selected = dates[0].toJD();
    var gregorian_date = $j.calendars.instance().fromJD(selected);
    $j('#gregorian_datepicker_placeholder').calendarsPicker('setDate', gregorian_date);
    $j('#date_field').val(gregorian_date.formatDate('YYYY-mm-dd'));
    $j(".form-group #date-1.date-picker").toggleClass('calendar-open');
  }, // Callback when a date is selected
  onClose: null, // Callback when a datepicker is closed
  altField: null, // Alternate field to update in synch with the datepicker
  altFormat: null, // Date format for alternate field, defaults to dateFormat
  constrainInput: true, // True to constrain typed input to dateFormat allowed characters
  commandsAsDateFormat: false, // True to apply formatDate to the command texts
  commands: this.commands, // Command actions that may be added to a layout by name
  renderer: $j.calendarsPicker.weekOfYearRenderer,
  });


  $j('#gregorian_datepicker_placeholder-2').calendarsPicker({
    calendar: $j.calendars.instance(), // The calendar to use
    prevText: '<i class="fa fa-angle-left" aria-hidden="true"></i>',
    nextText: '<i class="fa fa-angle-right" aria-hidden="true"></i>',
    pickerClass: 'calendar', // CSS class to add to this instance of the datepicker
    showOnFocus: true, // True for popup on focus, false for not
    showTrigger: null, // Element to be cloned for a trigger, null for none
    showAnim: '', // Name of jQuery animation for popup, '' for no animation
    showOptions: {}, // Options for enhanced animations
    showSpeed: 'normal', // Duration of display/closure
    popupContainer: null, // The element to which a popup calendar is added, null for body
    alignment: 'bottomLeft', // Alignment of popup - with nominated corner of input:
        // 'top' or 'bottom' aligns depending on language direction,
        // 'topLeft', 'topRight', 'bottomLeft', 'bottomRight'
    fixedWeeks: true, // True to always show 6 weeks, false to only show as many as are needed
    firstDay: null, // First day of the week, 0 = Sunday, 1 = Monday, ...
        // defaults to calendar local setting if null
    calculateWeek: null, // Calculate week of the year from a date, null for calendar default
    localNumbers: false, // True to localise numbers (if available),
        // false to use normal Arabic numerals
    monthsToShow: 1, // How many months to show, cols or [rows, cols]
    monthsOffset: 0, // How many months to offset the primary month by
    monthsToStep: 1, // How many months to move when prev/next clicked
    monthsToJump: 12, // How many months to move when large prev/next clicked
    changeMonth: true, // True to change month/year via drop-down, false for navigation only
    yearRange: 'c-10:c+10', // Range of years to show in drop-down: 'any' for direct text entry
        // or 'start:end', where start/end are '+-nn' for relative to today
        // or 'c+-nn' for relative to the currently selected date
        // or 'nnnn' for an absolute year
    showOtherMonths: true, // True to show dates from other months, false to not show them
    selectOtherMonths: false, // True to allow selection of dates from other months too
    defaultDate: null, // Date to show if no other selected
    selectDefaultDate: false, // True to pre-select the default date if no other is chosen
    minDate: null, // The minimum selectable date
    maxDate: null, // The maximum selectable date
    dateFormat: null, // Format for dates, defaults to calendar setting if null
    autoSize: false, // True to size the input field according to the date format
    rangeSelect: false, // Allows for selecting a date range on one date picker
    rangeSeparator: ' - ', // Text between two dates in a range
    multiSelect: 0, // Maximum number of selectable dates, zero for single select
    multiSeparator: ',', // Text between multiple dates
    onDate: null, // Callback as a date is added to the datepicker
    onShow: $j.calendarsPicker.hoverCallback(function() {
      $j('#gregorian_datepicker_placeholder-2 a').hover(function() {
        $j(this).toggleClass('calendars-highlight');
      })
    }), // Callback just before a datepicker is shown
    onChangeMonthYear: null, // Callback when a new month/year is selected
    onSelect: function(dates) {
      var selected = dates[0].toJD();
      var hijri_date = $j.calendars.instance('islamic').fromJD(selected);
      $j('#hijri_datepicker_placeholder-2').calendarsPicker('setDate', hijri_date);
      $j('#date_field-2').val(dates[0].formatDate('YYYY-mm-dd'));
      // $j(".form-group .date-picker").toggleClass('calendar-open');
    }, // Callback when a date is selected
    onClose: null, // Callback when a datepicker is closed
    altField: null, // Alternate field to update in synch with the datepicker
    altFormat: null, // Date format for alternate field, defaults to dateFormat
    constrainInput: true, // True to constrain typed input to dateFormat allowed characters
    commandsAsDateFormat: false, // True to apply formatDate to the command texts
    commands: this.commands, // Command actions that may be added to a layout by name
    renderer: $j.calendarsPicker.weekOfYearRenderer,
  });

  $j('#hijri_datepicker_placeholder-2').calendarsPicker({
    calendar: $j.calendars.instance('islamic'), // The calendar to use
    prevText: '<i class="fa fa-angle-left" aria-hidden="true"></i>',
    nextText: '<i class="fa fa-angle-right" aria-hidden="true"></i>',
    pickerClass: '', // CSS class to add to this instance of the datepicker
    showOnFocus: true, // True for popup on focus, false for not
    showTrigger: null, // Element to be cloned for a trigger, null for none
    showAnim: '', // Name of jQuery animation for popup, '' for no animation
    showOptions: {}, // Options for enhanced animations
    showSpeed: 'normal', // Duration of display/closure
    popupContainer: null, // The element to which a popup calendar is added, null for body
    alignment: 'bottomLeft', // Alignment of popup - with nominated corner of input:
        // 'top' or 'bottom' aligns depending on language direction,
        // 'topLeft', 'topRight', 'bottomLeft', 'bottomRight'
    fixedWeeks: true, // True to always show 6 weeks, false to only show as many as are needed
    firstDay: null, // First day of the week, 0 = Sunday, 1 = Monday, ...
        // defaults to calendar local setting if null
    calculateWeek: null, // Calculate week of the year from a date, null for calendar default
    localNumbers: false, // True to localise numbers (if available),
        // false to use normal Arabic numerals
    monthsToShow: 1, // How many months to show, cols or [rows, cols]
    monthsOffset: 0, // How many months to offset the primary month by
    monthsToStep: 1, // How many months to move when prev/next clicked
    monthsToJump: 12, // How many months to move when large prev/next clicked
    changeMonth: true, // True to change month/year via drop-down, false for navigation only
    yearRange: 'c-10:c+10', // Range of years to show in drop-down: 'any' for direct text entry
        // or 'start:end', where start/end are '+-nn' for relative to today
        // or 'c+-nn' for relative to the currently selected date
        // or 'nnnn' for an absolute year
    showOtherMonths: true, // True to show dates from other months, false to not show them
    selectOtherMonths: false, // True to allow selection of dates from other months too
    defaultDate: null, // Date to show if no other selected
    selectDefaultDate: false, // True to pre-select the default date if no other is chosen
    minDate: null, // The minimum selectable date
    maxDate: null, // The maximum selectable date
    dateFormat: null, // Format for dates, defaults to calendar setting if null
    autoSize: false, // True to size the input field according to the date format
    rangeSelect: false, // Allows for selecting a date range on one date picker
    rangeSeparator: ' - ', // Text between two dates in a range
    multiSelect: 0, // Maximum number of selectable dates, zero for single select
    multiSeparator: ',', // Text between multiple dates
    onDate: null, // Callback as a date is added to the datepicker
    onShow: $j.calendarsPicker.hoverCallback(function() {
      $j('#hijri_datepicker_placeholder-2 a').hover(function() {
        $j(this).toggleClass('calendars-highlight');
      })
    }), // Callback just before a datepicker is shown
    onChangeMonthYear: null, // Callback when a new month/year is selected
    onSelect: function(dates) {
      var selected = dates[0].toJD();
      var gregorian_date = $j.calendars.instance().fromJD(selected);
      $j('#gregorian_datepicker_placeholder-2').calendarsPicker('setDate', gregorian_date);
      $j('#date_field-2').val(gregorian_date.formatDate('YYYY-mm-dd'));
      $j(".form-group #date-2.date-picker").toggleClass('calendar-open');
    }, // Callback when a date is selected
    onClose: null, // Callback when a datepicker is closed
    altField: null, // Alternate field to update in synch with the datepicker
    altFormat: null, // Date format for alternate field, defaults to dateFormat
    constrainInput: true, // True to constrain typed input to dateFormat allowed characters
    commandsAsDateFormat: false, // True to apply formatDate to the command texts
    commands: this.commands, // Command actions that may be added to a layout by name
    renderer: $j.calendarsPicker.weekOfYearRenderer,
    });


function toggleDatepickerVisibility(id) {
  $j(".form-group #"+id).toggleClass('calendar-open');
}


// $j(function () {
//   var selectElement = $j('select.form-control');
//
//   function ifFirstOptionSelectedMakeItRed() {
//     if (selectElement[0].selectedIndex === 0) {
//       selectElement.addClass('first-option-selected');
//     } else {
//       selectElement.removeClass('first-option-selected');
//     }
//   }
//
//   ifFirstOptionSelectedMakeItRed();
//
//   selectElement.on('change', function () {
//     ifFirstOptionSelectedMakeItRed();
//   })
// });


$j("#editForm").click(function(){

  if( $j("#commentsFormContent").is(":visible") ){

    $j("#commentsFormContent").slideUp();

  }else{

    $j("#profileFormContent").slideUp();

    $j("#commentsFormContent").slideDown();

  };

});

$j("#commentsFormContentClose > i").click(function(){
  $j("#commentsFormContent").slideUp();
});



$j("#profileForm").click(function(){

  if( $j("#profileFormContent").is(":visible") ){

    $j("#profileFormContent").slideUp();

  }else{

    $j("#commentsFormContent").slideUp();

    $j("#profileFormContent").slideDown();

  };

});



$j("#profileFormContentClose > i").click(function(){

  $j("#profileFormContent").slideUp();

});
