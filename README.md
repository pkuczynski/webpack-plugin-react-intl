# webpack-plugin-react-intl
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fpkuczynski%2Fwebpack-plugin-react-intl.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fpkuczynski%2Fwebpack-plugin-react-intl?ref=badge_shield)


Webpack plugin, which aggregates messages extracted by [babel-plugin-react-intl](https://github.com/formatjs/formatjs/tree/master/packages/babel-plugin-react-intl) into single flat json translations file to be committed along the source code.

Committing messages along the source code helps to keep a track how your base messages change over time and use this information to identify which strings needs to be (re)translated.

To avoid webpack falling into infinite reload loop when run in development mode, messages file is being created only when its different than the previous version.

## Installation

    npm i -D webpack-plugin-react-intl

## Configuration

Add `babel-plugin-react-intl` to your babel configuration directly in [webpack](https://webpack.js.org/loaders/babel-loader/):


```js
module: {
  rules: [
    {
      test: /\.js$/,
      use: {
        loader: 'babel-loader',
        options: {
          plugins: [
            [ 'react-intl', { messagesDir: './build/messages' } ]
          ]
        }
      }
    }
  ]
}
```

or in [babel config](https://babeljs.io/docs/en/configuration):

```js
plugins: [
  [ 'react-intl', { messagesDir: './build/messages' } ]
]
```

Then add `webpack-plugin-react-intl` in the `webpack.config.js`:

```js
const ReactIntlPlugin = require('webpack-plugin-react-intl')

module.exports = {
  ...
  plugins: [
    new ReactIntlPlugin({
      source: './build/messages/src',
      destination: './src/i18n/translations/en.json'
    })
  ]
  ...
}
```

The `messagesDir` and `source` folders must match. Location of `destination` is up to you. 

Then you can use this file to feed `IntlProvider`

```jsx
const Intl = ({ locale, children }) => {
  const messages = require(`./translations/${locale}.json`
  return (
    <IntlProvider locale={locale} messages={messages}>
      {children}
    </IntlProvider>
  )
}

<Intl locale="en">
  <div>...</div>
</Intl>
```    

## Credits

This plugin was heavily inspired and covers functionality (with an extra spice) of following plugins:

* [react-intl-aggregate-webpack-plugin](https://github.com/maniax89/react-intl-aggregate-webpack-plugin)
  * opposite to this plugin, a flat structure file is being generated
* [react-intl-aggregate-flat-webpack-plugin](https://github.com/BedyCasa/react-intl-aggregate-webpack-plugin)
  * opposite to this plugin, file is being generated only when default translation change

## License

This software is [MIT Licensed](LICENSE)


[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fpkuczynski%2Fwebpack-plugin-react-intl.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fpkuczynski%2Fwebpack-plugin-react-intl?ref=badge_large)