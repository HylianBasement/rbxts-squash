// Types
declare namespace Squash {
    /** A string of unique characters that represent the basis of other strings. */
    export type Alphabet = string & {
        /** @hidden @deprecated */
        readonly _nominal_alphabet: unique symbol;
    };

    /** The number of bytes used to represent a number. */
    export type Bytes = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

    /** The number of bytes used to represent a floating point number. */
    export type FloatBytes = 4 | 8;

    /** An import of the Redblox Buffit Cursor type for better cross-library interaction */
    export interface Cursor {
        readonly Buf: buffer;
        Pos: number;
    }

    interface SquashString {
        (this: void, length?: number): SerDes<string>;

        /** Converts a string, treated as a number in base `inAlphabet`, to a number in base `toAlphabet`.  */
        convert(
            this: void,
            str: string,
            inAlphabet: Alphabet,
            toAlphabet: Alphabet,
        ): string;

        /** Returns the smallest sorted alphabet from a source string. */
        alphabet(this: void, source: string): Alphabet;

        /** The alphabet `'01'`. */
        readonly binary: Alphabet;

        /** The alphabet `'01234567'`. */
        readonly octal: Alphabet;

        /** The alphabet `'0123456789'`. */
        readonly decimal: Alphabet;

        /** The alphabet `'0123456789AB'`. */
        readonly duodecimal: Alphabet;

        /** The alphabet `'0123456789ABCDEF'`. */
        readonly hexadecimal: Alphabet;

        /** The alphabet of all 256 possible characters. */
        readonly utf8: Alphabet;

        /** The alphabet `'abcdefghijklmnopqrstuvwxyz'`. */
        readonly lower: Alphabet;

        /** The alphabet `'ABCDEFGHIJKLMNOPQRSTUVWXYZ'`. */
        readonly upper: Alphabet;

        /** The alphabet `lower .. upper`. */
        readonly letters: Alphabet;

        /** The alphabet `' .,?!:;\'"-_'`. */
        readonly punctuation: Alphabet;

        /** The alphabet `letters .. punctuation`. */
        readonly english: Alphabet;

        /** The alphabet `letters .. ':/'`. */
        readonly filepath: Alphabet;

        /** The alphabet of every character that doesn't get expanded when JSON encoding. */
        readonly datastore: Alphabet;
    }

    type NetworkableTypes = Omit<CheckableTypes, "function" | "thread" | "nil">;

    // table type is always "object", which of course, is what all data types are also assignable to
    type ExcludeTable<T extends keyof NetworkableTypes> = Exclude<T, "table">;

    type GenericTable<T extends keyof NetworkableTypes, U> = MixedTable<
        | NetworkableTypes[ExcludeTable<T>]
        | (U extends TableSerDes<infer V, infer W>
              ? Extract<W, TableSerDes<any, any>> extends TableSerDes<any, any>
                  ? GenericTable<V, W>
                  : MixedTable<NetworkableTypes[ExcludeTable<V>]>
              : never)
    >;

    type MixedTable<T> =
        | ReadonlyArray<T>
        | { [key: string | number]: T }
        | Map<T, T>;

    type AnySerDesType =
        | SerDes<any>
        | OptionalSerDes<any>
        | TupleSerDes<any>
        | TableSerDes<any, any>
        | IOSerDes<any>
        | BoolSerDes;

    type NonVariadicSerDesType = Exclude<AnySerDesType, TupleSerDes<any>>;

    type NonOptionalSerDesType = Exclude<
        NonVariadicSerDesType,
        OptionalSerDes<any>
    >;

    type InferValueType<T> =
        T extends SerDes<infer U>
            ? U
            : T extends OptionalSerDes<infer U>
              ? Optional<U>
              : T extends IOSerDes<infer U>
                ? IO<U>
                : T extends TableSerDes<infer U, infer V>
                  ? GenericTable<U, V>
                  : T extends BoolSerDes
                    ? boolean
                    : T;

    type SerDesOfNetworkableType<
        T extends keyof NetworkableTypes,
        U,
    > = T extends "table"
        ? U
        : T extends keyof IOSerDesMap
          ? IOSerDes<T>
          : T extends "boolean"
            ? BoolSerDes
            : SerDes<NetworkableTypes[T]>;

    type Unpack<T> = _<{ [K in keyof T]: InferValueType<T[K]> }>;

    type Remap<T, IOType extends boolean> =
        T extends Array<any>
            ? {
                  [K in keyof T]: Remap<
                      T[K] extends Optional<infer U> ? U | undefined : T[K],
                      IOType
                  >;
              }
            : T extends object
              ? T extends NetworkableTypes[Exclude<
                    keyof NetworkableTypes,
                    keyof CheckablePrimitives
                >]
                  ? T
                  : T extends IO<infer U>
                    ? U extends keyof IOSerDesMap
                        ? IOType extends false
                            ? IOSerDesMap[U][0]
                            : IOSerDesMap[U][1]
                        : never
                    : Reconstruct<
                          UnionToIntersection<
                              {
                                  [K in keyof T]: T[K] extends Optional<infer U>
                                      ? { [_ in K]?: Remap<U, IOType> }
                                      : { [_ in K]: Remap<T[K], IOType> };
                              }[keyof T]
                          >
                      >
              : T;

    type Input<T> = Remap<T, false>;

    type Output<T> = Remap<T, true>;

    type IsAllowedFixedLength<N extends number> = N extends
        | 0
        | 1
        | 2
        | 3
        | 4
        | 5
        | 6
        | 7
        | 8
        | 9
        | 10
        ? true
        : false;

    type FixedLengthArray<T, N extends number, A extends Array<T> = [], O = []> =
        IsAllowedFixedLength<N> extends false
            ? T[]
            : (A & { length: number })["length"] extends N
              ? O
              : FixedLengthArray<T, N, [...A, T], O | [...A, T]>;

    type IO<_> = {
        /** @hidden @deprecated */
        readonly _nominal_io: unique symbol;
    };

    type Optional<_> = {
        /** @hidden @deprecated */
        readonly _nominal_optional: unique symbol;
    };

    type SerDes<T> = {
        /** @hidden @deprecated */
        readonly _nominal_serDes: unique symbol;

        ser(this: void, cursor: Cursor, value: Input<T>): void;
        des(this: void, cursor: Cursor): Output<T>;
    };

    type OptionalSerDes<T> = {
        /** @hidden @deprecated */
        readonly _nominal_optionalSerDes: unique symbol;

        ser(this: void, cursor: Cursor, value?: Input<T>): void;
        des(this: void, cursor: Cursor): Output<T> | undefined;
    };

    type TupleSerDes<T extends Array<any>> = {
        /** @hidden @deprecated */
        readonly _nominal_tupleSerDes: unique symbol;

        ser(this: void, cursor: Cursor, ...values: Input<T>): void;
        des(this: void, cursor: Cursor): LuaTuple<Output<T>>;
    };

    type TableSerDes<T extends keyof NetworkableTypes, U> = {
        /** @hidden @deprecated */
        readonly _nominal_tableSerDes: unique symbol;

        ser(this: void, cursor: Cursor, value: GenericTable<T, U>): void;
        des(this: void, cursor: Cursor): GenericTable<T, U>;
    };

    type IOSerDes<T extends keyof IOSerDesMap> = {
        /** @hidden @deprecated */
        readonly _nominal_ioSerDes: unique symbol;

        ser(this: void, cursor: Cursor, input: IOSerDesMap[T][0]): void;
        des(this: void, cursor: Cursor): IOSerDesMap[T][1];
    };

    type BoolSerDes = {
        /** @hidden @deprecated */
        readonly _nominal_boolSerDes: unique symbol;

        ser(
            this: void,
            cursor: Cursor,
            b0: boolean,
            b1?: boolean,
            b2?: boolean,
            b3?: boolean,
            b4?: boolean,
            b5?: boolean,
            b6?: boolean,
            b7?: boolean,
        ): void;
        des(
            this: void,
            cursor: Cursor,
        ): LuaTuple<
            [
                boolean,
                boolean,
                boolean,
                boolean,
                boolean,
                boolean,
                boolean,
                boolean,
            ]
        >;
    };
}

// IO Types
declare namespace Squash {
    interface IOSerDesMap {
        RaycastResult: [RaycastResult, SquashRaycastResult];
    }

    interface SquashRaycastResult {
        Distance: number;
        Position: Vector3;
        Normal: Vector3;
        Material: Enum.Material;
    }
}

// Util
declare namespace Squash {
    export function cursor(size?: number, position?: number): Cursor;

    export function frombuffer(buf: buffer): Cursor;

    export function tobuffer(cursor: Cursor): buffer;

    /** Pretty prints a Cursor record. */
    export function print(cursor: Cursor): string;
}

// Primitives
declare namespace Squash {
    export const string: SquashString;

    export function boolean(): BoolSerDes;

    export function uint(bytes: Bytes): SerDes<number>;

    export function int(bytes: Bytes): SerDes<number>;

    export function number(bytes: FloatBytes): SerDes<number>;

    export function buffer(length?: number): SerDes<buffer>;
}

// Datatypes
declare namespace Squash {
    export function Axes(): SerDes<Axes>;

    export function BrickColor(): SerDes<BrickColor>;

    export function EnumItem<T extends Enum>(
        Enum: T,
    ): SerDes<T["GetEnumItems"] extends () => Array<infer U> ? U : never>;

    export function CatalogueSearchParams(): SerDes<CatalogSearchParams>;

    export function CFrame(positionSerDes: SerDes<number>): SerDes<CFrame>;

    export function Color3(): SerDes<Color3>;

    export function ColorSequenceKeypoint(): SerDes<ColorSequenceKeypoint>;

    export function ColorSequence(): SerDes<ColorSequence>;

    export function DateTime(): SerDes<DateTime>;

    export function Faces(): SerDes<Faces>;

    export function FloatCurveKey(): SerDes<FloatCurveKey>;

    export function Font(): SerDes<Font>;

    export function NumberRange(serDes: SerDes<number>): SerDes<NumberRange>;

    export function NumberSequenceKeypoint(
        serDes: SerDes<number>,
    ): SerDes<NumberSequenceKeypoint>;

    export function NumberSequence(
        serDes: SerDes<number>,
    ): SerDes<NumberSequence>;

    export function OverlapParams(): SerDes<OverlapParams>;

    export function RaycastParams(): SerDes<RaycastParams>;

    export function Vector3(serDes: SerDes<number>): SerDes<Vector3>;

    export function PathWaypoint(serDes: SerDes<number>): SerDes<PathWaypoint>;

    export function PhysicalProperties(): SerDes<PhysicalProperties>;

    export function Ray(serDes: SerDes<number>): SerDes<Ray>;

    /** Returns a `SquashRaycastResult` because Roblox does not allow instantiating RaycastResults. */
    export function RaycastResult(
        serDes: SerDes<number>,
    ): IOSerDes<"RaycastResult">;

    export function Vector2(serDes: SerDes<number>): SerDes<Vector2>;

    export function Rect(serDes: SerDes<number>): SerDes<Rect>;

    export function Region3(serDes: SerDes<number>): SerDes<Region3>;

    export function Region3int16(): SerDes<Region3int16>;

    export function RotationCurveKey(
        positionSerDes: SerDes<number>,
    ): SerDes<RotationCurveKey>;

    export function TweenInfo(): SerDes<TweenInfo>;

    export function UDim(serDes: SerDes<number>): SerDes<UDim>;

    export function UDim2(serDes: SerDes<number>): SerDes<UDim2>;

    export function Vector2int16(): SerDes<Vector2int16>;

    export function Vector3int16(): SerDes<Vector3int16>;
}

// Misc
declare namespace Squash {
    export function vlq(): SerDes<number>;

    export function opt<T extends NonOptionalSerDesType>(
        serDes: T,
    ): OptionalSerDes<InferValueType<T>>;
}

// Data structures
declare namespace Squash {
    export function array<T extends NonVariadicSerDesType>(
        serDes: T,
    ): SerDes<Array<InferValueType<T>>>;
    export function array<T extends NonVariadicSerDesType, N extends number>(
        serDes: T,
        length: N,
    ): SerDes<FixedLengthArray<InferValueType<T>, N>>;

    export function map<
        K extends NonVariadicSerDesType,
        V extends NonVariadicSerDesType,
    >(
        keySerDes: K,
        valueSerDes: V,
    ): SerDes<Map<InferValueType<K>, InferValueType<V>>>;

    export function record<T extends Record<string, NonVariadicSerDesType>>(
        schema: T,
    ): SerDes<Unpack<T>>;

    export function tuple<T extends Array<NonVariadicSerDesType>>(
        ...values: T
    ): TupleSerDes<Unpack<T>>;

    /**
     * Serializes tables given a schema mapping types to serializers. If a type is not defined in the schema, it will be ignored when serializing tables.
     * **This is an expensive and heavy serializer compared to Record, Map, and Array. It is highly recommended that you do not use this for tables you know the type of already.**
     */
    export function table<T extends keyof NetworkableTypes, U>(schema: {
        [K in T]: SerDesOfNetworkableType<K, U>;
    }): TableSerDes<T, Extract<U, TableSerDes<any, any>>>;

    export function literal<const T extends Array<any>>(...values: T): SerDes<T[number]>;
}

export = Squash;
