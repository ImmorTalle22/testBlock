let periodSelectedDate = null;
let periodDateRange = { start: null, end: null };
let periodCurrentMonth = new Date().getMonth();
let periodCurrentYear = new Date().getFullYear();
let periodType = '';

document.addEventListener('DOMContentLoaded', function () {
    periodGenerateCalendar(periodCurrentMonth, periodCurrentYear, 'exact');
    periodGenerateCalendar(periodCurrentMonth, periodCurrentYear, 'range');

    const periodPhoneInput = document.getElementById('period-phone');
    window.periodPhoneInputObj = window.intlTelInput(periodPhoneInput, {
        initialCountry: "ru",
        separateDialCode: true,
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
    });

    periodSetupEventListeners();
});

function periodSetupEventListeners() {
    document.getElementById('period-step-1-btn').addEventListener('click', function () {
        periodShowStep('period-step-2');
    });

    document.getElementById('period-exact-btn').addEventListener('click', function () {
        periodType = 'exact';
        periodShowStep('period-step-3-exact');
    });

    document.getElementById('period-range-btn').addEventListener('click', function () {
        periodType = 'range';
        periodShowStep('period-step-3-range');
    });

    document.getElementById('period-prev-month-exact').addEventListener('click', function () {
        periodChangeMonth(-1, false);
    });

    document.getElementById('period-next-month-exact').addEventListener('click', function () {
        periodChangeMonth(1, false);
    });

    document.getElementById('period-prev-month-range').addEventListener('click', function () {
        periodChangeMonth(-1, true);
    });

    document.getElementById('period-next-month-range').addEventListener('click', function () {
        periodChangeMonth(1, true);
    });

    document.getElementById('period-btn-next-exact').addEventListener('click', function () {
        periodShowStep('period-step-4');
        document.querySelector('.period-form').style.cssText = 'overflow: hidden;';
    });

    document.getElementById('period-btn-next-range').addEventListener('click', function () {
        periodShowStep('period-step-4');
        document.querySelector('.period-form').style.cssText = 'overflow: hidden;';
    });

    document.getElementById('period-submit-btn').addEventListener('click', periodSubmitForm);

    function periodToggleCalendar(calendarId, formContainer) {
        const calendar = document.getElementById(calendarId);
        const container = document.querySelector(formContainer);

        calendar.classList.toggle('period-form__calendar-container--active');

        if (calendar.classList.contains('period-form__calendar-container--active')) {
            container.style.cssText = 'overflow: inherit;';
        } else {
            container.style.cssText = 'overflow: hidden;';
        }
    }

    document.getElementById('period-selected-date-exact').addEventListener('click', function () {
        periodToggleCalendar('period-calendar-container-exact', '.period-form');
    });

    document.getElementById('period-selected-date-range').addEventListener('click', function () {
        periodToggleCalendar('period-calendar-container-range', '.period-form');
    });
}

function periodShowStep(stepId) {
    document.querySelectorAll('.period-form__step').forEach(step => {
        step.classList.remove('period-form__step--active');
    });

    document.querySelectorAll('.period-form__calendar-container').forEach(calendar => {
        calendar.classList.remove('period-form__calendar-container--active');
    });

    document.getElementById(stepId).classList.add('period-form__step--active');
}

function periodGenerateCalendar(month, year, type) {
    const calendarId = type === 'exact' ? 'period-calendar-exact' : 'period-calendar-range';
    const calendar = document.getElementById(calendarId);
    const monthYearElement = type === 'exact' ?
        document.getElementById('period-current-month-exact') :
        document.getElementById('period-current-month-range');

    calendar.innerHTML = '';

    const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
        "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
    monthYearElement.textContent = `${monthNames[month]} ${year}`;

    const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const headerRow = document.createElement('tr');
    daysOfWeek.forEach(day => {
        const th = document.createElement('th');
        th.textContent = day;
        headerRow.appendChild(th);
    });
    calendar.appendChild(headerRow);

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let startingDay = firstDay === 0 ? 6 : firstDay - 1;

    let date = 1;
    for (let i = 0; i < 6; i++) {
        const row = document.createElement('tr');

        for (let j = 0; j < 7; j++) {
            const cell = document.createElement('td');

            if (i === 0 && j < startingDay) {
                cell.textContent = '';
            } else if (date > daysInMonth) {
                cell.textContent = '';
            } else {
                cell.textContent = date;
                cell.dataset.date = `${year}-${month + 1}-${date}`;

                cell.addEventListener('click', function () {
                    periodHandleDateSelection(this, type);
                });

                if (type === 'exact' && periodSelectedDate === cell.dataset.date) {
                    cell.classList.add('period-form__date-selected');
                } else if (type === 'range') {
                    const cellDate = new Date(year, month, date);
                    if (periodDateRange.start && cellDate.getTime() === periodDateRange.start.getTime()) {
                        cell.classList.add('period-form__date-selected');
                    } else if (periodDateRange.end && cellDate.getTime() === periodDateRange.end.getTime()) {
                        cell.classList.add('period-form__date-selected');
                    } else if (periodDateRange.start && periodDateRange.end &&
                        cellDate > periodDateRange.start && cellDate < periodDateRange.end) {
                        cell.classList.add('period-form__date-in-range');
                    }
                }

                date++;
            }

            row.appendChild(cell);
        }

        calendar.appendChild(row);

        if (date > daysInMonth) {
            break;
        }
    }
}

function periodHandleDateSelection(cell, type) {
    const dateStr = cell.dataset.date;
    const [year, month, day] = dateStr.split('-').map(Number);
    const selectedDateObj = new Date(year, month - 1, day);

    if (type === 'exact') {
        document.querySelectorAll('#period-calendar-exact td.period-form__date-selected').forEach(td => {
            td.classList.remove('period-form__date-selected');
        });

        cell.classList.add('period-form__date-selected');
        periodSelectedDate = dateStr;

        const dateInput = document.getElementById('period-selected-date-exact');
        const formattedDate = `${day}.${month}.${year}`;
        dateInput.value = formattedDate;

        document.getElementById('period-calendar-container-exact').classList.remove('period-form__calendar-container--active');

        document.getElementById('period-btn-next-exact').disabled = false;
    } else {
        if (!periodDateRange.start || (periodDateRange.start && periodDateRange.end)) {
            periodDateRange.start = selectedDateObj;
            periodDateRange.end = null;

            document.querySelectorAll('#period-calendar-range td.period-form__date-selected, #period-calendar-range td.period-form__date-in-range').forEach(td => {
                td.classList.remove('period-form__date-selected', 'period-form__date-in-range');
            });

            cell.classList.add('period-form__date-selected');
        } else if (periodDateRange.start && !periodDateRange.end) {
            periodDateRange.end = selectedDateObj;

            if (periodDateRange.end < periodDateRange.start) {
                [periodDateRange.start, periodDateRange.end] = [periodDateRange.end, periodDateRange.start];
            }

            periodUpdateRangeSelection();

            document.getElementById('period-calendar-container-range').classList.remove('period-form__calendar-container--active');

            document.getElementById('period-btn-next-range').disabled = false;
        }

        const dateInput = document.getElementById('period-selected-date-range');
        if (periodDateRange.start && periodDateRange.end) {
            const startFormatted = `${periodDateRange.start.getDate()}.${periodDateRange.start.getMonth() + 1}.${periodDateRange.start.getFullYear()}`;
            const endFormatted = `${periodDateRange.end.getDate()}.${periodDateRange.end.getMonth() + 1}.${periodDateRange.end.getFullYear()}`;
            dateInput.value = `с ${startFormatted} по ${endFormatted}`;
        } else if (periodDateRange.start) {
            const startFormatted = `${periodDateRange.start.getDate()}.${periodDateRange.start.getMonth() + 1}.${periodDateRange.start.getFullYear()}`;
            dateInput.value = `с ${startFormatted}`;
        }
    }
}

function periodUpdateRangeSelection() {
    const cells = document.querySelectorAll('#period-calendar-range td');
    cells.forEach(cell => {
        if (!cell.dataset.date) return;

        const [year, month, day] = cell.dataset.date.split('-').map(Number);
        const cellDate = new Date(year, month - 1, day);

        cell.classList.remove('period-form__date-selected', 'period-form__date-in-range');

        if (cellDate.getTime() === periodDateRange.start.getTime() ||
            cellDate.getTime() === periodDateRange.end.getTime()) {
            cell.classList.add('period-form__date-selected');
        } else if (periodDateRange.start && periodDateRange.end &&
            cellDate > periodDateRange.start && cellDate < periodDateRange.end) {
            cell.classList.add('period-form__date-in-range');
        }
    });
}

function periodChangeMonth(direction, isRange = false) {
    periodCurrentMonth += direction;

    if (periodCurrentMonth < 0) {
        periodCurrentMonth = 11;
        periodCurrentYear--;
    } else if (periodCurrentMonth > 11) {
        periodCurrentMonth = 0;
        periodCurrentYear++;
    }

    if (isRange) {
        periodGenerateCalendar(periodCurrentMonth, periodCurrentYear, 'range');
    } else {
        periodGenerateCalendar(periodCurrentMonth, periodCurrentYear, 'exact');
    }
}

function periodSubmitForm() {
    const phoneNumber = window.periodPhoneInputObj.getNumber();

    if (!window.periodPhoneInputObj.isValidNumber()) {
        return;
    }

    const formData = {
        periodType: periodType,
        phone: phoneNumber
    };

    if (periodType === 'exact') {
        formData.date = periodSelectedDate;
    } else {
        formData.dateRange = {
            start: periodDateRange.start ? `${periodDateRange.start.getDate()}.${periodDateRange.start.getMonth() + 1}.${periodDateRange.start.getFullYear()}` : null,
            end: periodDateRange.end ? `${periodDateRange.end.getDate()}.${periodDateRange.end.getMonth() + 1}.${periodDateRange.end.getFullYear()}` : null
        };
    }

    console.log('Данные формы:', formData);


    periodResetForm();
}

function periodResetForm() {
    periodSelectedDate = null;
    periodDateRange = { start: null, end: null };
    periodType = '';

    document.querySelectorAll('.period-form__step').forEach(step => {
        step.classList.remove('period-form__step--active');
    });
    document.getElementById('period-step-1').classList.add('period-form__step--active');

    document.getElementById('period-phone').value = '';
    window.periodPhoneInputObj.setNumber('');

    document.getElementById('period-selected-date-exact').value = '';
    document.getElementById('period-selected-date-range').value = '';

    document.getElementById('period-btn-next-exact').disabled = true;
    document.getElementById('period-btn-next-range').disabled = true;
}