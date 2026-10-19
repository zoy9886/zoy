import Phaser from "phaser";
import { TouchControls } from "../ui/controls";
export class Player {
  sprite: Phaser.Physics.Arcade.Sprite;
  keys: Record<string, Phaser.Input.Keyboard.Key>;
  direction = 0;
  constructor(scene: Phaser.Scene, x: number, y: number, blue: boolean) {
    this.sprite = scene.physics.add
      .sprite(x, y, "worker")
      .setDepth(y)
      .setScale(1.35);
    this.sprite.setSize(13, 10).setOffset(9, 21);
    this.sprite.setCollideWorldBounds(true);
    if (blue) this.sprite.setTint(0xb5dbe9);
    this.keys = scene.input.keyboard!.addKeys(
      "W,A,S,D,UP,DOWN,LEFT,RIGHT,E,SPACE",
    ) as Record<string, Phaser.Input.Keyboard.Key>;
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
    const velocity = new Phaser.Math.Vector2(x, y).normalize().scale(125);
    this.sprite.setVelocity(velocity.x, velocity.y);
    if (x || y) {
      this.direction = x < 0 ? 1 : x > 0 ? 2 : y < 0 ? 3 : 0;
      this.sprite.play(`walk-${this.direction}`, true);
    } else {
      this.sprite.anims.stop();
      this.sprite.setFrame(this.direction * 3);
    }
    this.sprite.setDepth(this.sprite.y);
  }
}
