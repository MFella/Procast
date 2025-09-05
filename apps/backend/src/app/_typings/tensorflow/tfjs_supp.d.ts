export type TensorLike3D =
  | TypedArray
  | number[]
  | number[][][]
  | boolean[]
  | boolean[][][]
  | string[]
  | string[][][]
  | Uint8Array[]
  | Uint8Array[][][];

export type TensorLike2D =
  | TypedArray
  | number[]
  | number[][]
  | boolean[]
  | boolean[][]
  | string[]
  | string[][]
  | Uint8Array[]
  | Uint8Array[][];
