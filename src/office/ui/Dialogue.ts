import { paintPortrait, type Look } from "../art/people";
export type DialogueChoice = {
  id: string;
  label: string;
  detail?: string;
  disabledReason?: string;
  select: () => void;
};
export type Line = { title: string; text: string; choices?: DialogueChoice[] };
export class OfficeDialogue {
  private root = document.querySelector<HTMLDialogElement>("#dialogue")!;
  private lines: Line[] = [];
  private index = 0;
  private done = () => {};
  private endLabel = "收進心裡，繼續探索";
  constructor() {
    document
      .querySelector("#next")!
      .addEventListener("click", () => this.next());
    document
      .querySelector("#defer")!
      .addEventListener("click", () => this.root.close());
    this.root.addEventListener("cancel", (e) => e.preventDefault());
    document.addEventListener("keydown", (e) => {
      if (this.root.open && !e.repeat && ["e", "E", " "].includes(e.key)) {
        e.preventDefault();
        this.next();
      }
    });
  }
  show(
    person: { name: string; role: string; look: Look },
    lines: Line[],
    done = () => {},
    options: { endLabel?: string; defer?: boolean } = {},
  ) {
    this.lines = lines;
    this.index = 0;
    this.done = done;
    this.endLabel = options.endLabel || "收進心裡，繼續探索";
    document.querySelector("#speaker")!.textContent = person.name;
    document.querySelector("#speaker-role")!.textContent = person.role;
    paintPortrait(document.querySelector("#portrait")!, person.look);
    (document.querySelector("#defer") as HTMLButtonElement).hidden =
      !options.defer;
    this.render();
    if (!this.root.open) this.root.showModal();
  }
  private render() {
    const line = this.lines[this.index];
    document.querySelector("#dialog-title")!.textContent = line.title;
    document.querySelector("#dialog-text")!.textContent = line.text;
    const choices = document.querySelector("#dialog-choices")!;
    choices.replaceChildren();
    (document.querySelector("#next") as HTMLButtonElement).hidden =
      !!line.choices?.length;
    if (line.choices?.length)
      (document.querySelector("#defer") as HTMLButtonElement).hidden = true;
    for (const choice of line.choices || []) {
      const button = document.createElement("button");
      button.dataset.choice = choice.id;
      button.className = "dialogue-choice";
      button.disabled = !!choice.disabledReason;
      const title = document.createElement("strong");
      title.textContent = choice.label;
      button.append(title);
      if (choice.detail || choice.disabledReason) {
        const detail = document.createElement("small");
        detail.textContent = choice.disabledReason || choice.detail!;
        button.append(detail);
      }
      button.addEventListener("click", () => {
        this.root.close();
        choice.select();
      });
      choices.append(button);
    }

    document.querySelector("#page-number")!.textContent =
      `${String(this.index + 1).padStart(2, "0")} / ${String(this.lines.length).padStart(2, "0")}`;
    document.querySelector("#next")!.textContent =
      this.index === this.lines.length - 1 ? this.endLabel : "繼續 →";
  }
  private next() {
    if (this.lines[this.index]?.choices?.length) return;
    if (++this.index < this.lines.length) this.render();
    else {
      this.root.close();
      this.done();
    }
  }
}
