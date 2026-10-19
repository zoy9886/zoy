import Phaser from "phaser";
import { SiteScene } from "./world/SiteScene";
import "./style.css";
new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#344b57",
  pixelArt: true,
  roundPixels: true,
  scale: { mode: Phaser.Scale.RESIZE, width: "100%", height: "100%" },
  physics: { default: "arcade", arcade: { debug: false } },
  scene: [SiteScene],
  input: { keyboard: true, touch: true },
  render: { antialias: false },
});
document.querySelector("#journal-toggle")!.addEventListener("click", () => {
  const journal = document.querySelector("#journal")!;
  journal.classList.toggle("expanded");
  if (journal.classList.contains("expanded"))
    journal.scrollIntoView({ behavior: "smooth", block: "nearest" });
});
