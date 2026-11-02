// Home offer banner pictures (DECISIONS D-99), drawn in the tile style. node tools/tiles/build-banners.mjs
import * as k from './lib.mjs';
const { B } = k;

export const BANNERS = {
  meat: k.scene('rose', k.meatCut(560, 2.6, B - 30), k.fish(250, 2.7, '#8fb3d1', -6, B - 20), k.drumstick(420, 2.9, -8), k.prawns(640, 1.7, B + 6), k.drumstick(180, 2.2, 18, B + 6)),
  flowers: k.scene('orange', k.garland(400, 70, 560, 110, '#ff9800'), k.lotus(260, 2.3), k.marigold(400, 340, 62, '#ff8f00'), k.marigold(495, 362, 50, '#ffb300'), k.marigold(318, 368, 44, '#ffca28'), k.rose(565, 2.1), k.tulsi(645, 1.9)),
  sweets: k.scene('rose', k.flatBox(585, 2.6, '#e53935', '#ffd54f', B - 46), k.tinCan(640, 2.0, '#ffffff', '#c62828', B + 8), k.plate(400, 3.4), k.blob(345, 2.3, '#ffb74d', 26, 26, B - 18), k.blob(440, 2.3, '#ffa726', 26, 26, B - 18), k.blob(392, 2.3, '#ffcc80', 26, 26, B - 92), k.kajuKatli(205, 2.6, B + 6)),
  veggies: k.scene('green', k.leaf(195, 2.4, '#43a047', -16), k.carrot(610, 2.3, 14), k.banana(530, 2.0, B - 2), k.cucumber(265, 2.3, -12), k.onion(470, 1.9, B + 4), k.tomato(365, 2.4), k.chilli(670, 2.0, '#2e7d32', 12), k.tomato(305, 1.6, B + 10)),
  diwali: k.scene('violet', k.sparkle(200, 100, 28), k.sparkle(610, 90, 24, '#ff7043'), k.sparkle(410, 70, 18, '#ffee58'), k.sparkle(540, 160, 14), k.sparkle(270, 170, 12, '#ec407a'),
    k.rocket(170, 2.0, '#e53935', -8, B - 82), k.rocket(630, 2.0, '#43a047', 8, B - 82), k.diya(262, 1.4), k.diya(538, 1.4), k.diya(400, 1.6, B + 4)),
};
