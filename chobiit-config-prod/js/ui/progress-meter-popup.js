const LocaleService = require('chobiit-common/src/application/locale-service').default;
const localeService = LocaleService.getInstance("config");

/**
 * 
 * @param {string} key 
 * @param {Record<string, any> | undefined} option 
 * @returns {string}
*/
const translateInfo = (key, option) => localeService.translate("info", key, option);

/**
 * 
 * @param {string} key 
 * @param {Record<string, any> | undefined} option 
 * @returns {string}
*/
const translateCommon = (key, option) => localeService.translate("common", key, option);

/**
 * 
 * @param {string} key 
 * @param {Record<string, any> | undefined} option 
 * @returns {string}
*/
const translateError = (key, option) => localeService.translate("error", key, option);


const $ = jQuery


/**
 * 進捗バーを実装するクラスです。
 * 
 * ※オブジェクトの初期化の際に、コンストラクタ内で非同期処理を待つことが出来ないので、苦肉の策として
 * 新しく定義したinitializeメソッドで非同期処理を行い、それををawaitすることで対応しています。
 * したがって、オブジェクトの初期化の際は、newによるオブジェクトの初期化と、initializeメソッドによる
 * オブジェクト初期化の二つが必要になります。
 * 
 * ex.)
 * 
 * 1. const popup = new ProgressMeterPopup()
 * 2. await popup.initialize("CSV_IMPORT")
 * 
 * こちらのクラスを使いたい場合は、スタティック変数: progressMeterUseCases にユースケースを追加して使用してください
 * @class
 */
export class ProgressMeterPopup {
    constructor(progressMeterUseCase, totalNum) {
        if (!ProgressMeterPopup.isAvailableUseCase(progressMeterUseCase)) {
            throw new Error(`Invalid progress meter use case: ${progressMeterUseCase}. Available use cases are: ${Object.keys(ProgressMeterPopup.progressMeterUseCases).join(', ')}`)
        }

        this.progressMeterUseCase = progressMeterUseCase
        this.progressMeterPopup = null
        this.progressPercentage = 0
        this.totalNum = totalNum
    }

    // 非同期初期化メソッド
    async initialize() {
        this.progressMeterPopup = await this.generateProgressMeterPopup()
    }

    static progressMeterUseCases = Object.freeze({
        CSV_IMPORT_CREATE_AND_UPDATE: 'csv-import-create-and-update',
        CSV_IMPORT_PROCESSING: 'csv-import-processing'
    })

    static isAvailableUseCase(useCase) {
        const availableUseCases = ProgressMeterPopup.progressMeterUseCases

        if (Object.keys(availableUseCases).includes(useCase)) {
            return true
        } else {
            return false
        }
    }

    static calcPercentage(completedNum, totalNum) {
        if (totalNum === 0) {
            // totalNumが0の場合は取り扱うものが無いので完了とみなし, 進捗を100%として扱います
            // また, この部分で0除算を回避しています
            return 100
        }
        return Math.round(100 * (completedNum / totalNum))
    }

    setProgressPercentage(completedNum) {
        this.progressPercentage = ProgressMeterPopup.calcPercentage(completedNum, this.totalNum)
        $(`.progress-meter-${this.progressMeterUseCase}`).attr('value', this.progressPercentage)
        $(`.progress-meter-${this.progressMeterUseCase}-percentage`)
            .text(translateInfo("user-setting.add-user.bulk-file-validate.progress-meter-modal.progress-percentage", { percentage: this.progressPercentage }))
    }

    generateProgressMeterPopup() {
        return new Promise((resolve, reject) => {
            try {
                $.alert({
                    title: translateInfo("user-setting.add-user.bulk-file-validate.progress-meter-modal.title"),
                    content: `<progress class="progress-meter-${this.progressMeterUseCase}" max="100" value="${ProgressMeterPopup.calcPercentage(0, this.totalNum)}"></progress><h1 class="progress-meter-${this.progressMeterUseCase}-percentage"></h1>`,
                    closeOnEscape: false,
                    onOpenBefore: function () {
                        this.buttons.cancel.hide()
                    },
                    onContentReady: function () {
                        resolve(this)
                    },
                    buttons: {
                        cancel: {
                            text: 'Cancel',
                        }
                    }
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    close() {
        try {
            if (this.progressMeterPopup && typeof this.progressMeterPopup.close === 'function') {
                this.progressMeterPopup.close()
            }
        } catch (error) {
            throw new Error(error)
        }
    }

}

export class CreateAndUpdateProgressMeterPopup extends ProgressMeterPopup {
    constructor(progressMeterUseCase, createTotalNum, updateTotalNum) {
        super(progressMeterUseCase)
        this.createTotalNum = createTotalNum
        this.updateTotalNum = updateTotalNum
    }

    // 非同期初期化メソッド
    async initialize() {
        this.progressMeterPopup = await this.generatecreateAndUpdateProgressMeterPopup()
    }

    setCreateProgress(createCompletedNum) {
        const createProgressPercentage = CreateAndUpdateProgressMeterPopup.calcPercentage(createCompletedNum, this.createTotalNum)

        setProgressPercentage(createProgressPercentage)
        setProgressItems(createCompletedNum, this.createTotalNum)

        function setProgressPercentage(createProgressPercentage) {
            $(`.progress-meter-csv-import-create`).attr('value', createProgressPercentage)
            $(`.progress-meter-csv-import-create-percentage`)
                .text(translateInfo("user-setting.add-user.bulk-add-and-update-users.progress-meter-modal.progress-percentage", { percentage: createProgressPercentage }))
        }
        function setProgressItems(createProgressItems, createTotalNum) {
            $(`.progress-meter-csv-import-create-items`)
                .text(translateInfo("user-setting.add-user.bulk-add-and-update-users.progress-meter-modal.completed-item", { completedNum: createProgressItems, totalNum: createTotalNum }))
        }
    }


    setUpdateProgress(updateCompletedNum) {
        const updateProgressPercentage = CreateAndUpdateProgressMeterPopup.calcPercentage(updateCompletedNum, this.updateTotalNum)

        setProgressPercentage(updateProgressPercentage)
        setProgressItems(updateCompletedNum, this.updateTotalNum)

        function setProgressPercentage(updateProgressPercentage) {
            $(`.progress-meter-csv-import-update`).attr('value', updateProgressPercentage)
            $(`.progress-meter-csv-import-update-percentage`)
                .text(translateInfo("user-setting.add-user.bulk-add-and-update-users.progress-meter-modal.progress-percentage", { percentage: updateProgressPercentage }))
        }
        function setProgressItems(updateCompletedNum, updateTotalNum) {
            $(`.progress-meter-csv-import-update-items`)
                .text(translateInfo("user-setting.add-user.bulk-add-and-update-users.progress-meter-modal.completed-item", { completedNum: updateCompletedNum, totalNum: updateTotalNum }))
        }
    }

    generatecreateAndUpdateProgressMeterPopup() {
        return new Promise((resolve, reject) => {
            try {
                $.alert({
                    title: translateInfo("user-setting.add-user.bulk-add-and-update-users.progress-meter-modal.title"),
                    content: `
                        <h1>${translateInfo("user-setting.add-user.bulk-add-and-update-users.progress-meter-modal.add-title")}</h1>
                        <progress class="progress-meter-csv-import-create" max="100" value="${CreateAndUpdateProgressMeterPopup.calcPercentage(0, this.createTotalNum)}"></progress>
                        <a class="progress-meter-csv-import-create-items">${translateInfo("user-setting.add-user.bulk-add-and-update-users.progress-meter-modal.completed-item", { completedNum: 0, totalNum: this.createTotalNum })}</a>
                        <br><h1 class="progress-meter-csv-import-create-percentage">${translateInfo("user-setting.add-user.bulk-add-and-update-users.progress-meter-modal.progress-percentage", { percentage: CreateAndUpdateProgressMeterPopup.calcPercentage(0, this.createTotalNum) })}</h1>
                        <h1>${translateInfo("user-setting.add-user.bulk-add-and-update-users.progress-meter-modal.update-title")}</h1>
                        <progress class="progress-meter-csv-import-update" max="100" value="${CreateAndUpdateProgressMeterPopup.calcPercentage(0, this.updateTotalNum)}"></progress>
                        <a class="progress-meter-csv-import-update-items">${translateInfo("user-setting.add-user.bulk-add-and-update-users.progress-meter-modal.completed-item", { completedNum: 0, totalNum: this.updateTotalNum })}</a>
                        <br><h1 class="progress-meter-csv-import-update-percentage">${translateInfo("user-setting.add-user.bulk-add-and-update-users.progress-meter-modal.progress-percentage", { percentage: CreateAndUpdateProgressMeterPopup.calcPercentage(0, this.updateTotalNum) })}</h1>`,
                    closeOnEscape: false,
                    onOpenBefore: function () {
                        this.buttons.cancel.hide()
                    },
                    onContentReady: function () {
                        resolve(this)
                    },
                    buttons: {
                        cancel: {
                            text: 'cancel',
                        }
                    }
                })
            } catch (error) {
                reject(error)
            }
        })
    }
}
