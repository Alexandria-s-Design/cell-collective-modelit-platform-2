class Storage{
    static get VERSION_KEY(){ return "cacheVersion"; }
    static set(key, value){
        localStorage[key] = value;
    } 
    static has(key){
        return Storage.get(key) !== undefined;
    } 
    static get(key){
        return localStorage[key];
    } 
    static remove(key){
        localStorage.removeItem(key);
    }
    static checkVersion(version){
        return Storage.get(Storage.VERSION_KEY) === undefined
            || Storage.get(Storage.VERSION_KEY) === version;
    }
    static setVersion(version){
        if(
            !Storage.checkVersion(version)
        ){
            Storage.clear();
        }
        Storage.set(Storage.VERSION_KEY, version);
    }    
    static clear({ threshold = 1 } = { }){

        const RULES = [
            { 
                test: s => /.*/.test(s),
                priority: 0
            },
            { 
                test: s => /^\.globalLayout$/.test(s),
                priority: 1
            },
            {
                test: s => /^VERSION\[\d+\](?!\.(undefined|Main))/.test(s),
                priority: 1
            },
        ]


        const rules = RULES.filter(rule => rule.priority >= threshold)
                        .map(({test})=>test);
    
        const keys = Object.keys(localStorage)
            .filter(key => 
                rules.some((test) => test(key))
            );
    
        keys.forEach(key => Storage.remove(key));
    }
}

//import util from "./util";

export default Storage;