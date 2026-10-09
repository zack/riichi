# Fancy tiles

These are the tiles from the "Full set" table on Wikipedia's [Mahjong tiles](https://en.wikipedia.org/wiki/Mahjong_tiles) page, with the red fives from its "Red tiles" section and the blank white dragon from its "Dragons" section. They're by [Cangjie6](https://commons.wikimedia.org/wiki/User:Cangjie6), some of them remade from originals by Jerry Crimson Mann and Dewclouds, and they're on [Wikimedia Commons](https://commons.wikimedia.org/wiki/Category:SVG_Oblique_illustrations_of_Mahjong_tiles) under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

What's different from the originals:

- The files are renamed to match the plain tiles one folder up, and run through [SVGO](https://svgo.dev/) to make them smaller.
- The three red fives (`Man0.svg`, `Pin0.svg` and `Sou0.svg`) each have a dot added to the face, the way the plain tiles one folder up mark theirs. Without it only the color of the ink tells a red five from a plain five.
- `Back.svg` isn't one of theirs. It's the blank white dragon with the face turned green and the sides turned cream, for the face-down tiles of a concealed kan.
- The app's icons are made from `Pin7.svg`. That's `favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, and the four `icon*.png` files in `public/`. Some of them sit the tile on a dark background, and none of them change the tile itself.

`Back.svg`, the red fives with their dots and the icons are under CC BY-SA 4.0 too, the same as the tiles they're made from.
