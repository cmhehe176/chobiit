import CalendarViewService from "../service/calendar-view-service";
import { CalendarView } from "chobiit-common/src/types/chobiit";

export function createFullCalendar(
    isPublicListRecord: boolean,
    firstDateOfDisplayingMonth,
    calendarView: CalendarView,
    appId: string,
    appInfo,
    records,
    body
) {
    $('#recordTable').parent().hide();
    const calendarEl = document.getElementById('calendar');
    $(calendarEl).empty();
    const event_color = calendarView.event_color;
    let eventLimit = true;
    if (calendarView.eventLimit == false) {
        eventLimit = false;
    }
    return new FullCalendar.Calendar(calendarEl, {
        eventLimit: eventLimit,
        showNonCurrentDates: false,
        defaultDate: firstDateOfDisplayingMonth.toDate(),
        plugins: ['interaction', 'dayGrid'],
        editable: false,
        eventSources: [CalendarViewService.getEventSource(records, calendarView, appId, isPublicListRecord)],
        // events: events,
        eventColor: event_color,
        height: 700,
        locale: process.env.CHOBIIT_LANG,
        eventLimitText: function (numEvents) {
            return numEvents > 1 ? `+${numEvents} events` : `+1 event`
        },
        eventTimeFormat: {
            hour: '2-digit',
            minute: '2-digit',
            hour12: process.env.CHOBIIT_LANG === 'en',
        },
        header: {
            left: 'prev,next ',
            center: 'title',
            right: ''
        },
        displayEventEnd: true,
        eventClick: function (info) {
            /**
             * 以下は"認証あり"と"外部公開"のコードを共通化した際の差分です.
             * 仕様の違いから差分が生じています.
             */
            if (isPublicListRecord) {
                if (appInfo) {
                    sessionStorage.setItem('appInfo', JSON.stringify(appInfo));
                }
            } else {
                const id = info.event.id;
                const recordRight = body.rights.find(x => x.id == id);
                if (recordRight) {
                    sessionStorage.setItem('recordRight', JSON.stringify(recordRight));
                }
            }

        }
    });
}
