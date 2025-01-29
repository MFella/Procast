export class TypeHelper {
  static isUnknownAnObject<T extends string>(
    value: unknown,
    ...fields: Array<T>
  ): value is Record<T, any> {
    return (
      typeof value === 'object' &&
      value !== null &&
      fields.every((field) => field in value)
    );
  }
}
