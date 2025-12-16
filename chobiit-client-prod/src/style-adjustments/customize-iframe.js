/**
 * Iframeの高さを調整する
 */
function setMaxHeightIframe() {
    const pos = $(document).height() - $('#iframe').offset().top - 35
    $('#iframe').css("max-height", pos);
}
module.exports = setMaxHeightIframe