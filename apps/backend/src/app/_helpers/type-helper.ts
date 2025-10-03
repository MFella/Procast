export class TypeHelper {
  static isTwoNumberTuple(object: unknown): object is [number, number] {
    return (
      object &&
      Array.isArray(object) &&
      object.length === 2 &&
      object.every((entry) => Number.isFinite(entry))
    );
  }
}
