import AppConfig from '../app.json';

const SetCookie = (name, value) => {
    let base = AppConfig.urls.base;
    if( base.startsWith('http://') ){
        base = base.split('http://')[1];
    }else if( base.startsWith('https://') ){
        base = base.split('https://')[1];
    }else;
    document.cookie = `${name}=${value};domain=${base.split(':')[0]}`; //remove port from hostname
};

const GetCookie = name => {
    const crumbs = document.cookie.split(';').map(e => e.trim());
    for( let crumb = 0; crumb < crumbs.length; crumb++ ){
        const cookie = crumbs[crumb];
        const cname = cookie.split('=')[0];
        if( cname === name ){
            return cookie.split('=').slice(1).join('=');
        }
    }
    return undefined;
}

const DeleteCookie = name => {
    document.cookie = `${name}=; max-age=-1;`;
};

export { SetCookie, GetCookie, DeleteCookie };