export const h = (tagName, props, ...children) => {
  if (typeof tagName === 'function') return tagName(props);
  
  const node = Object.assign(document.createElement(tagName), props);
  Object.assign(node.style, (props || {}).style);
  children
    .reduce((acc, cur) => acc.concat(cur), [])
    .forEach(child => node.appendChild((typeof child === 'object') ? child : document.createTextNode(child)));
  
  return node;
};

export const component = (initState, view, reducer = (state, action) => action, registerSubscriptions = dispatch => null) => root => {
  let state = initState;
  const cacheProps = e => ({id:e.id, selectionStart:e.selectionStart, selectionEnd:e.selectionEnd, selectionDirection:e.selectionDirection, scrollTop:e.scrollTop, scrollLeft:e.scrollLeft});
  const renderer = tree => {  
    const focusedId = (document.activeElement || {id:''}).id;
    const identifiedElements = Array.prototype.map.call(document.querySelectorAll('[id]'), cacheProps);
    while (root.firstChild) root.removeChild(root.firstChild);
    root.appendChild(tree);
    identifiedElements.forEach(element => {
      const newElement = document.getElementById(element.id);
      if (newElement) {
        if(element.id === focusedId) newElement.focus();
        Object.assign(newElement, element);
      }
    });
  };
  const dispatch = action => Promise.resolve(action).then(action => {
    state = reducer(state, action);
    renderer(view(state, dispatch));
  });
  registerSubscriptions(dispatch);
  renderer(view(state, dispatch));
};
