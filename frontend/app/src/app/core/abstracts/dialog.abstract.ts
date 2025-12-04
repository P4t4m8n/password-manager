export abstract class AbstractDialog<T = string | null> {
  #resolvePromise: ((value: T) => void) | null = null;

  open(): Promise<T> {
    return new Promise((resolve) => {
      this.#resolvePromise = resolve;
    });
  }
  protected resolve(value: T): void {
    if (this.#resolvePromise) {
      this.#resolvePromise(value);
      this.#resolvePromise = null;
    }
  }

  cancel(): void {
    this.resolve(null as T);
  }

  abstract submit(): void;
}
