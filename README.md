# Riichi Scoring Trainer

A web app for practicing scoring in riichi mahjong. It deals you a winning hand, and you work out the han, the fu, and the points.

<table>
  <tr>
    <th valign="middle">Light mode, before showing the answer</th>
    <th valign="middle">Dark mode, with more options turned on,<br />showing the answer</th>
  </tr>
  <tr>
    <td align="center" valign="top"><img src="screenshot-light.png" alt="The trainer in light mode, showing a hand with a concealed kan and a han and fu picked but not checked yet" width="380" /></td>
    <td align="center" valign="top"><img src="screenshot-dark.png" alt="The trainer in dark mode with the fancy tiles and the tile names, showing a riichi hand won by tsumo with a concealed kan, uradora, and honba, and the answer box with the points from the dealer and from the others" width="380" /></td>
  </tr>
</table>

# FAQ

## Where did this come from?

This is a fork of [Varantha/Mahjong-ScoringTrainer](https://github.com/Varantha/Mahjong-ScoringTrainer). The hands and the scoring logic are Varantha's work and the work of the people who contributed there.

## Where do the hands come from?

All hands are taken directly from the [original repository](https://github.com/Varantha/Mahjong-ScoringTrainer), which themselves came from Tenhou logs.

## What languages does it support?

English, Japanese (日本語), Korean (한국어), and Chinese (Simplified) (中文简体).

All of the non-english text is computer generated. If you'd like to provide translation support, please reach out, or check out the [Translation Guide](TRANSLATION_GUIDE.md).

# Running it locally

1. Clone the repo
   ```sh
   git clone git@github.com:zack/riichi.git
   cd riichi
   ```
1. Install the dependencies
   ```sh
   npm install
   ```
1. Start the dev server. It prints the address to open, usually http://localhost:5173
   ```sh
   npm run dev
   ```
1. Or make a production build, which lands in `dist/`, and serve it
   ```sh
   npm run build
   npm run preview
   ```

The service worker that makes it work offline only runs in a production build.

# Testing

There are Cypress tests for the scoring, for accessibility, and for how it looks. They run in Chrome against the production build on port 5173.

1. Build and serve the app
   ```sh
   npm run build
   npm run preview -- --port 5173
   ```
1. Run the tests
   ```sh
   npm run cypress:cli
   ```

The visual tests compare screenshots against the ones in `cypress/snapshots/base`. If you changed how something looks on purpose, take new ones and commit them.

```sh
npm run cypress:update-snapshots
```

# Special Thanks

- [Varantha](https://github.com/Varantha) for the original trainer and the log parser.
- [escheraz](https://github.com/escheraz) for the exact fu option.
- [Cangjie6](https://commons.wikimedia.org/wiki/User:Cangjie6) for the fancy tiles, which are on Wikimedia Commons under CC BY-SA 4.0. The details are in [their folder](public/assets/tiles/fancy/README.md).
- The people the original thanks: [Euophrys](https://github.com/Euophrys), [ApplySci](https://github.com/ApplySci), [MahjongRepository](https://github.com/MahjongRepository), [NegativeMjark](https://github.com/NegativeMjark), [FluffyStuff](https://github.com/FluffyStuff), [Elthron](https://github.com/Elthron), and [fathoms](https://github.com/fathoms).

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
