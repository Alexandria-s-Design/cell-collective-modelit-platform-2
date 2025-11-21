export default link_code => {
    const l = document.createElement('div');
    l.innerHTML = link_code;
    l.getElementsByTagName('a')[0].target = "_blank";
    return l.innerHTML;
};