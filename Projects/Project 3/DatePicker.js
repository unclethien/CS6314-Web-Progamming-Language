"use strict";
class DatePicker {
  constructor(id, callback) {
    this.div = document.getElementById(id);
    this.callback = callback;
    this.selectedDate = null;
    this.today = new Date();
  }

  render(date) {
    this.currentMonth = date.getMonth();
    this.currentYear = date.getFullYear();
    this.div.innerHTML = "";
    this.createHeader();
    this.createDaysOfWeek();
    this.createDaysOfMonth();
  }

  createHeader() {
    const header = document.createElement("div");
    header.classList.add("datepicker-header");

    const prevButton = document.createElement("button");
    prevButton.textContent = "<";
    prevButton.addEventListener("click", () => this.changeMonth(-1));
    header.appendChild(prevButton);

    const monthYearDisplay = document.createElement("span");
    monthYearDisplay.textContent = `${DatePicker.getMonthName(
      this.currentMonth
    )} ${this.currentYear}`;
    header.appendChild(monthYearDisplay);

    const nextButton = document.createElement("button");
    nextButton.textContent = ">";
    nextButton.addEventListener("click", () => this.changeMonth(1));
    header.appendChild(nextButton);

    this.div.appendChild(header);
  }

  createDaysOfWeek() {
    const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const row = document.createElement("div");
    row.classList.add("datepicker-days-of-week");
    daysOfWeek.forEach((day) => {
      const dayCell = document.createElement("div");
      dayCell.classList.add("datepicker-day");
      dayCell.textContent = day;
      row.appendChild(dayCell);
    });
    this.div.appendChild(row);
  }

  createDaysOfMonth() {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const daysInMonth = new Date(
      this.currentYear,
      this.currentMonth + 1,
      0
    ).getDate();

    const calendarGrid = document.createElement("div");
    calendarGrid.classList.add("datepicker-grid");

    // Add days from the previous month
    const prevMonthDays = firstDay;
    const daysInPrevMonth = new Date(
      this.currentYear,
      this.currentMonth,
      0
    ).getDate();
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const dayCell = this.createDayCell(
        day,
        true,
        this.currentMonth - 1,
        this.currentYear
      );
      calendarGrid.appendChild(dayCell);
    }

    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayCell = this.createDayCell(
        day,
        false,
        this.currentMonth,
        this.currentYear
      );
      calendarGrid.appendChild(dayCell);
    }

    // Add days from the next month to complete the last week
    const totalDaysDisplayed = prevMonthDays + daysInMonth;
    const daysToAdd = (7 - (totalDaysDisplayed % 7)) % 7;
    for (let day = 1; day <= daysToAdd; day++) {
      const dayCell = this.createDayCell(
        day,
        true,
        this.currentMonth + 1,
        this.currentYear
      );
      calendarGrid.appendChild(dayCell);
    }

    this.div.appendChild(calendarGrid);
  }

  createDayCell(day, isDimmed, month, year) {
    const dayCell = document.createElement("div");
    dayCell.classList.add("datepicker-day");
    if (isDimmed) {
      dayCell.classList.add("dimmed");
    }
    dayCell.textContent = day;

    if (this.isToday(day, month, year)) {
      dayCell.classList.add("today");
    }

    dayCell.addEventListener("click", () => {
      this.selectedDate = { day, month: month + 1, year };
      this.callback(this.div.id, this.selectedDate);
    });

    return dayCell;
  }

  isToday(day, month, year) {
    return (
      day === this.today.getDate() &&
      month === this.today.getMonth() &&
      year === this.today.getFullYear()
    );
  }

  changeMonth(offset) {
    this.currentMonth += offset;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.render(new Date(this.currentYear, this.currentMonth, 1));
  }

  static getMonthName(monthIndex) {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return monthNames[monthIndex];
  }
}
