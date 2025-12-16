// const jwtDecode = require('jwt-decode');

(function (global) {
    // export function to global
    // global.updateUserInfo = updateToken;

    let idToken = JSON.parse(localStorage.getItem('idToken'))
    let isLogin = isLoginPage();
    try {
        // if localStorage haven't token redirect to login page
        if (!idToken) {
            throw new Error('Token does not exist');
        }

        // if token expired redirect to login page

        let now = new Date().getTime()/1000;
        if (now > idToken.payload.exp) {
            throw new Error('Token expired');
        }   

        // if current page is login page and localStorage have valid token redirect to list app
        isLogin ? redirectTo('./list_app.html') : '';
    } catch (error) {
        var current =  window.location.href;

        isLogin ? '' : redirectTo('./login.html?redirect=' +  current);
    }
})(window);

function redirectTo(link) {
    window.location.href = link;
}

function isLoginPage() {
    let path = window.location.pathname;
    path = path.slice(path.lastIndexOf('/'));
    return path === '/' || path === '/login.html';
}

// function updateToken(token) {
//     if (token && typeof token === 'string') {
//         window.localStorage.removeItem('token');
//         window.sessionStorage.removeItem('decodedToken');
//         let decodedToken = jwtDecode(token);
//         window.localStorage.setItem('token', token);
//         window.sessionStorage.setItem('decodedToken', JSON.stringify(decodedToken));
//     }
// }