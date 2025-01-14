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

  // static isNotPartialType<T extends Record<any, any>>(object: Partial<T>): object is T {
  //   return Object.create()
  // }
}
