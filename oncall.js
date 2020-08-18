$(document).ready(function () {
  moment.locale('cs');
  var paidPercents = 10;

  // add new HTML inputs
  var addInputs = function () {
    var random = Math.random().toString(36).substring(7);
    $('.js-to-clone-input-row').clone().appendTo('.inputs');
    $('.inputs .js-to-clone-input-row').removeClass('js-to-clone-input-row');
    $('.inputs #work_checkbox').attr('id', 'work_checkbox_' + random);
    $('.inputs [for="work_checkbox"]').attr('for', 'work_checkbox_' + random);
  };

  addInputs();

  // add new input row click
  $('.js-add-row').click(function () {
    addInputs();
    return false;
  });

  // remove input row click
  $(document).on('click', '.js-remove-row', function () {
    $(this).closest('.form-row').remove();

    if ($('.inputs .form-row').length === 0) {
      addInputs();
    }
    return false;
  });

  var isHolidayDay = function (date) {
    var holidays = ['1.1.', '10.4.', '13.4.', '1.5.', '8.5.', '5.7.', '6.7.', '28.9.', '28.10.', '17.11.', '24.12.', '25.12.', '26.12.'];
    return holidays.indexOf(date.format(date.format('D.M.'))) > -1;
  };

  // click on "Pracoval jsem" checkbox
  $(document).on('change', '.js-work', function () {
    var $tbody = $(this).closest('.form-row').find('.js-work-wrapper table tbody');

    if ($(this).prop('checked') === false) {
      $tbody.html('');
      $(this).closest('.form-row').find('.js-work-wrapper').hide();
      return false;
    }

    var from = $(this).closest('.form-row').find('input.js-from').val();
    var to = $(this).closest('.form-row').find('input.js-to').val();

    if(!from || !to) {
      alert('Vyplňte datumy od-do');
      $(this).prop('checked', false);
      return false;
    }

    var mFrom = moment(from);
    var mTo = moment(to);

    if (mFrom > mTo) {
      alert('Datum do musí být větší než datum od');
      $(this).prop('checked', false);
      return false;
    }

    var onCallDays = Math.ceil(moment.duration(mTo.diff(mFrom)).asDays()) + 1;

    for (i = 1; i <= onCallDays; i++) {
      var now = moment(from).add(i - 1, 'days');

      var isWeekend = momentBusiness.isWeekendDay(now);

      $('.js-to-clone-work-row').clone().appendTo($tbody);
      $tbody.find('.js-to-clone-work-row .date').html(now.format('D. M. Y'));
      $tbody.find('.js-to-clone-work-row .day').html(now.format('dddd'));
      if (isWeekend || isHolidayDay(now)) {
        $tbody.find('.js-to-clone-work-row').addClass('table-warning');
      }

      $tbody.find('.js-to-clone-work-row').removeClass('js-to-clone-work-row');
    }

    $(this).closest('.form-row').find('.js-work-wrapper').show();

    return false;
  });

  $(document).on('change', '.js-hours', function () {
    var isHoliday = $(this).closest('tr').hasClass('table-warning');
    var maxHours = 16;
    if (isHoliday) {
      maxHours = 24;
    }

    if (parseFloat($(this).val()) > maxHours) {
      alert('Hodnota nesmí být vyšší než ' + maxHours + ' hodin.');
      $(this).val(maxHours);
      return false;
    }
  });

  // submit form click
  $('.js-submit').click(function () {
    var onCallWorkedHours = 0;
    var data = {
      onCallHours: 0,
      onCallMDs: 0,
      workedHours: 0,
      workedMDs: 0,
      paidHours: 0,
      paidMDs: 0,
    };

    $('.inputs .form-row').each(function () {
      var $wrapper = $(this);
      var from = $(this).find('input.js-from').val();
      var to = $(this).find('input.js-to').val();

      var mFrom = moment(from);
      var mTo = moment(to);
      var onCallDays = Math.ceil(moment.duration(mTo.diff(mFrom)).asDays()) + 1;
      var now, isWeekend;

      if ($(this).find('.js-work-wrapper:visible').length === 0) {
        for (i = 1; i <= onCallDays; i++) {
          now = moment(from).add(i - 1, 'days');
          isWeekend = momentBusiness.isWeekendDay(now) | isHolidayDay(now);

          if (isWeekend) {
            data.onCallHours = parseFloat((data.onCallHours + 24).toFixed(3));
          } else {
            data.onCallHours = parseFloat((data.onCallHours + 16).toFixed(3));
          }
        }
      } else {
        for (i = 1; i <= onCallDays; i++) {
          now = moment(from).add(i - 1, 'days');
          isWeekend = momentBusiness.isWeekendDay(now) | isHolidayDay(now);

          var hours = parseFloat($wrapper.find('table tr:nth-child('+i+') input').val());
          if (isWeekend) {
            data.onCallHours = parseFloat((data.onCallHours + (24 - hours)).toFixed(3));
          } else {
            data.onCallHours = parseFloat((data.onCallHours + (16 - hours)).toFixed(3));
          }
          data.workedHours += hours;
        }
      }
    });

    data.paidHours = parseFloat((data.onCallHours / paidPercents + data.workedHours * 1.5).toFixed(3));
    data.onCallMDs = parseFloat((data.onCallHours / 8).toFixed(3));
    data.workedMDs = parseFloat((data.workedHours / 8).toFixed(3));
    data.paidMDs = parseFloat((data.paidHours / 8).toFixed(3));

    Object.keys(data).forEach(function (key) {
      $('.js-result-' + key).text(data[key]);
    });

    $('.js-result-table').show();

    return false;
  });

})