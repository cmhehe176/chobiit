import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import LocaleService from 'chobiit-common/src/application/locale-service'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(timezone)
dayjs.extend(customParseFormat)
dayjs.extend(utc)

export class DateTimeControlWrapper {
    /**
     * OSまたはブラウザのタイムゾーンが Asia/Tokyo の場合は、このメッドを使用し明示的に9時間引くようにしている
     * これは、１888年より前、日本の標準時はGMT+9:00ではなくGMT+9:18:59　(文献によって様々であるが この時間付近)であり、
     * dayjsもこの仕様を持っているため1880年より前の年の日時を指定すると18:59　だけズレてしまう、そのため明示的に9時間引くような対応をしている
     * 他のタイムゾーンに対しても世界標準時が制定された 1884年周辺の年で標準時時刻が変更さている恐れがあるが、現在は日本のみ対応ををしている
     * @param targetDateTime 変換したい日時
     */
    static convertJSTtoUTC(targetDateTime:string):string{
       return dayjs(targetDateTime, `YYYY-MM-DD ${LocaleService.getTimeFormat()}`).subtract(9, 'hour').format('YYYY-MM-DDTHH:mm:ss[Z]')
    }

    /**
     * OSまたはブラウザのタイムゾーンに依存して変換処理が実施される
     * 例えば、ブラジルのタイムゾーンであれば、-03:00 が付与され、中国のタイムゾーンであれば、+08:00 が付与される
     * @param targetDateTime 変換したい日時
     */
    static convertToUTC(targetDateTime:string):string{
        return dayjs(targetDateTime, `YYYY-MM-DD ${LocaleService.getTimeFormat()}`).utc().format()
    }

    /**
     * @param targetTime 変換したい時間
     */
    static convert24HourClock(targetTime:string):string {    
        return dayjs(targetTime, LocaleService.getTimeFormat()).format("HH:mm")
    }

    static getTimeZone():string {
        return dayjs.tz.guess()
    }
}