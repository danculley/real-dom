## real-dom: a < 1K non-virtual DOM framework for simple apps

Virtual DOM frameworks are all the rage. But the real DOM is faster than you might think. Each time you call its dispatch function, Real-DOM simply replaces the entire DOM tree under its root node with your new view. This makes it simple and uncluttered. It weighs in at only 32 lines of code before minifying, and less than 1K after. It has built-in support for Redux-style actions and reducers, but also supports simpler models too. It is in ES2015 module format.

#### Without using virtual DOM, won't my app be slow?
Apps with thousands of DOM nodes or that frequently redraw their views may benefit significantly from avoiding DOM mutation. But most applications aren't that complex and do not update very frequently. If you are developing a game or the next Facebook, then you should probably consider using React or one of the many virtual DOM alternatives. If you just want typeahead results or simple todos, you won't really notice it.

#### If Real-DOM replaces the DOM tree on each update, how does it preserve focus?
Before replacing the view, Real-DOM stores a reference to the document's active element. After replacing the view, Real-DOM will return focus to the element with the same `id` attribute. In modern browsers, this happens fast enough that it does not interrupt typing in a non-debounced [controlled input](https://facebook.github.io/react/docs/forms.html#controlled-components).

#### How does it perform in benchmarks?
Probably not very well. If you have a very complex DOM tree or redraw your view very frequently, it's not the right approach for you.

#### Is this compatiable with JSX?
Yes, if you [configure Babel](https://babeljs.io/docs/plugins/transform-react-jsx/) to use its `h` function instead of `React.createElement`. Keep in mind that Real-DOM does not have a simulated event system like React, and it doesn't accept other full components as arguments. It does, though, accept functions. See the API documentation below. It has not been thoroughly tested.

#### Can this be rendered on the server side?
Theoretically, but it has not been thoroughly tested. You'll need a synthetic document object, such as [jsdom](https://github.com/tmpvar/jsdom).

## API documentation
Real-DOM exposes only two functions: `component` and `h`. `component` takes, at minimum, an initial state and a function that renders your view. It can also take a Redux-style reducer and a factory function for registering callbacks to external events, such as a Web Socket. `h` is named in honor of hyperscript and follows the same syntax with some simplifications.

### `component(initialState, view, [reducer, registerSubscriptions])`

#### Return value
A function `HTMLElement -> void`. When invoked, the function mounts the application as a child of that root node. The root node should not have any other children: they will be removed from the tree on each update of the view.

#### Arguments
1. `initialState`: the application's initial state. It accepts any value: object, array, primitive.
2. `view`: a function `(state, dispatch) -> HTMLElement`. This function will be invoked with `initialState` when the application is mounted, and then again each time the dispatch function is called. The result will be appended as a child to the root node (see the return value above). The `h` function below is provided to make composing this function easier.
3. `reducer`: a function `(state, action) -> *`. The value returned from the function becomes the application's new state. It is good practice for this to be a pure function. If the action it receives is a `Promise`, it will execute after the `Promise` resolves.  The default is `(state, action) => action`. That is, it sets the application's new state to whatever value is passed to the `dispatch` function of the view.
4. `registerSubscriptions`: a function `dispatch -> void`. The function will be invoked immediately after the application is mounted. Use this function to register callbacks to external services, so that they can call the dispatch function, e.g., a Web Socket, firebase, meteor.

### `h(tag|function, [attrs, ...children])`
#### Return value
An `HTMLElement`.

#### `tag|function`
Either the tag name of the html element or a function. If it is invoked with a function, that function will be called with the value of the `attrs` argument, similar to a stateless functional component in React.

#### `attrs`
An object containing the attributes to be applied to the html element. Use the JavaScript names for accessing attributes; for example, `className` instead of `class`. It supports registering events by passing functions for `onevent` attributes. The only special handling is for the style attribute, which can take either a string or an object with individual CSS properties.

If a function was passed to `tag`, then that function will be executed with this parameter, without any parsing.

The default is an empty object.

#### `...children`
Any remaining parameters are handled as children to the node. Strings are wrapped with a call to `document.createTextNode`. Arrays are flattened and their elements handled as other parameters.
