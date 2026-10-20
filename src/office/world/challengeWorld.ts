import Phaser from "phaser";
import type { ChallengeState } from "../systems/challengeModel";
export class ChallengeWorld {
  private steel: Phaser.GameObjects.Text;
  private support: Phaser.GameObjects.Text;
  private status: Phaser.GameObjects.Text;
  constructor(scene: Phaser.Scene) {
    const label = (x: number, y: number) =>
      scene.add
        .text(x, y, "", {
          fontFamily: "sans-serif",
          fontSize: "9px",
          backgroundColor: "#34535de8",
          color: "#eee2be",
          padding: { x: 6, y: 4 },
        })
        .setOrigin(0.5)
        .setDepth(y + 120);
    this.steel = label(305, 388);
    this.support = label(1040, 400);
    this.status = label(420, 505);
  }
  messages() {
    return [this.steel, this.support, this.status]
      .filter((t) => t.visible)
      .map((t) => t.text);
  }
  update(c: ChallengeState) {
    this.steel.setVisible(c.status !== "available");
    this.support.setVisible(c.chen !== "none");
    this.status.setVisible(c.status === "complete");
    this.steel.setText(
      c.wu === "none"
        ? "C3・工班紙本待核對"
        : c.wu === "force" && !c.wuRepaired
          ? "先核對現況・資訊待釐清"
          : c.wu === "assist"
            ? "工程師協助核對・B 版待交接"
            : "工班持 B 版・待文件交接",
    );
    this.support.setText(
      c.chen === "rush" && !c.chenCorrected
        ? "建議未獲採用・維持待確認"
        : c.chen === "review"
          ? "支撐調整待確認・計畫核對中"
          : "支撐調整待確認・不自行放行",
    );
    this.status.setText(
      c.report === "verified"
        ? "已回報協調・仍由負責人確認"
        : "工程師已要求補查・維持管制",
    );
  }
}
