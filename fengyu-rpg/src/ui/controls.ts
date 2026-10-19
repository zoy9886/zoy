export class TouchControls {
  directions = new Set<string>();
  interact = false;
  constructor() {
    document.querySelectorAll<HTMLButtonElement>("[data-dir]").forEach((b) => {
      const dir = b.dataset.dir!;
      b.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        b.setPointerCapture(e.pointerId);
        this.directions.add(dir);
      });
      for (const name of ["pointerup", "pointercancel", "lostpointercapture"])
        b.addEventListener(name, () => this.directions.delete(dir));
    });
    document
      .querySelector("#interact")!
      .addEventListener("pointerdown", (e) => {
        e.preventDefault();
        this.interact = true;
      });
    window.addEventListener("blur", () => this.directions.clear());
  }
}
