import LocaleService from "chobiit-common/src/application/locale-service"

export class JqueryDateTimePicker {

    private static getFormat(fieldType:string) {
        switch(fieldType) {
            case 'TIME':
                return LocaleService.getTimeFormat()
            case 'DATETIME':
                return `YYYY-MM-DD ${LocaleService.getTimeFormat()}`
            case 'DATE':
                return 'YYYY-MM-DD'
        } 
    } 

    static render(targetJqueryElement:any,fieldType:string) {
        targetJqueryElement.datetimepicker({
            format: this.getFormat(fieldType),
            locale: process.env.CHOBIIT_LANG,
            icons: {
                time: 'fas fa-clock',
                date: 'fas fa-calendar',
            },
            defaultDate:new Date()
        });
    }
}