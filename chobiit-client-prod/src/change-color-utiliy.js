/* eslint-disable no-useless-escape */
module.exports = {
    changeColor
};


/**
 * get Color Template
 * 
 * @param appId, token 
 */
function changeColor(appId){
    const domain = window.getKintoneDomain();

    let url = window._config.api.getColor.replace(/{appId}/, appId)+ '?domain=' + domain;
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            let response = JSON.parse(this.responseText);
            let body = JSON.parse(response.body);
            let templateColor = body.templateColor;
            
            if (templateColor){
                $('.sidebar').css("background-color", templateColor.backgroundColor.bcolor1);
                $('.sidebar .submenu').css("background-color", lightenDarkenColor(templateColor.backgroundColor.bcolor1, -20));

                $('.sidebar .nav .nav-link.active').css("background-color", templateColor.backgroundColor.bcolor2);
                $('.header').css("background-color", templateColor.backgroundColor.bcolor3);

                $('.btn-green').css("background-color", templateColor.backgroundColor.bcolor2);
                $('.btn-green').hover(
                  function (){
                    $(this).css('background-color', lightenDarkenColor(templateColor.backgroundColor.bcolor2, -30))
                  },
                  function (){
                    $(this).css('background-color', lightenDarkenColor(templateColor.backgroundColor.bcolor2, 20))
                  }
                )

                $('.sidebar .brand-title').css("color", templateColor.fontColor.fcolor1);

                $('.sidebar .submenu .item').css("color", templateColor.fontColor.fcolor2);
                

                $('#dropdownMenuButton').css("color", templateColor.fontColor.fcolor3);


                
            }
        }
    };
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send();
}

function lightenDarkenColor(color, percent) {
  
    var R = parseInt(color.substring(1,3),16);
    var G = parseInt(color.substring(3,5),16);
    var B = parseInt(color.substring(5,7),16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R<255)?R:255;  
    G = (G<255)?G:255;  
    B = (B<255)?B:255;  

    var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
  
}