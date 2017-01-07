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
  const renderer = tree => {  
    const focused = document.activeElement;
    const {selectionStart, selectionEnd} = focused
    while (root.firstChild) root.removeChild(root.firstChild);
    root.appendChild(tree);
    const newFocused = document.getElementById((focused||{id:''}).id)
    if (newFocused) {
      newFocused.focus()
      Object.assign(newFocused, {selectionStart, selectionEnd})
    }
  };
  const dispatch = action => Promise.resolve(action).then(action => {
    state = reducer(state, action);
    renderer(view(state, dispatch));
  });
  registerSubscriptions(dispatch);
  renderer(view(state, dispatch));
};
