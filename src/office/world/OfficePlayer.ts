import Phaser from "phaser";
import { TouchControls } from "../../ui/controls";
export class OfficePlayer {
  sprite: Phaser.Physics.Arcade.Sprite;
  keys: Record<string, Phaser.Input.Keyboard.Key>;
  direction = 0;
  private helmet = false;
  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add
      .sprite(x, y, "person-intern", 0)
      .setOrigin(0.5, 1)
      .setDepth(y);
    this.sprite.setSize(14, 10).setOffset(11, 36).setCollideWorldBounds(true);
    this.keys = scene.input.keyboard!.addKeys(
      "W,A,S,D,UP,DOWN,LEFT,RIGHT,E,SPACE",
    ) as Record<string, Phaser.Input.Keyboard.Key>;
    scene.input.keyboard!.removeCapture([
      Phaser.Input.Keyboard.KeyCodes.W,
      Phaser.Input.Keyboard.KeyCodes.A,
      Phaser.Input.Keyboard.KeyCodes.S,
      Phaser.Input.Keyboard.KeyCodes.D,
      Phaser.Input.Keyboard.KeyCodes.SPACE,
      Phaser.Input.Keyboard.KeyCodes.E,
    ]);
  }
  setHelmet(value: boolean) {
    if (this.helmet === value) return;
    this.helmet = value;
    this.sprite.anims.stop();
    this.sprite.setTexture(
      value ? "person-intern-helmet" : "person-intern",
      this.direction * 3,
    );
    this.sprite.setSize(14, 10).setOffset(11, 36);
  }
  update(touch: TouchControls, blocked: boolean) {
    const k = this.keys,
      d = touch.directions;
    let x = 0,
      y = 0;
    if (!blocked) {
      x =
        +(k.D.isDown || k.RIGHT.isDown || d.has("right")) -
        +(k.A.isDown || k.LEFT.isDown || d.has("left"));
      y =
        +(k.S.isDown || k.DOWN.isDown || d.has("down")) -
        +(k.W.isDown || k.UP.isDown || d.has("up"));
    }
    const v = new Phaser.Math.Vector2(x, y).normalize().scale(140);
    this.sprite.setVelocity(v.x, v.y);
    const texture = this.helmet ? "person-intern-helmet" : "person-intern";
    if (x || y) {
      this.direction = x < 0 ? 1 : x > 0 ? 2 : y < 0 ? 3 : 0;
      this.sprite.play(`${texture}-walk-${this.direction}`, true);
    } else {
      this.sprite.anims.stop();
      this.sprite.setFrame(this.direction * 3);
    }
    this.sprite.setDepth(this.sprite.y);
    return !!(x || y);
  }
}
