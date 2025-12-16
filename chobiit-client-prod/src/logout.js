document.getElementById('logout').addEventListener('click', e => {
    e.preventDefault();
    localStorage.removeItem('idToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('config');
    sessionStorage.removeItem('apps');
    window.location.href = './login.html';
});

document.getElementById('changeUserInfo').addEventListener('click', e => {
    e.preventDefault();
    window.location.href = './user_info.html';
});