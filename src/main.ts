import Phaser from "phaser";
import { OfficeScene } from "./office/world/OfficeScene";
import "./office/office.css";
new Phaser.Game({
  type: Phaser.CANVAS,
  parent: "game",
  backgroundColor: "#344e59",
  pixelArt: true,
  roundPixels: true,
  scale: { mode: Phaser.Scale.RESIZE, width: "100%", height: "100%" },
  physics: { default: "arcade", arcade: { debug: false } },
  scene: [OfficeScene],
  input: { keyboard: true, touch: true },
  render: { antialias: false },
});
