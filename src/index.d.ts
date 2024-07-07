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
		Buf: buffer;
		Pos: number;
	}

	interface SquashRaycastResult {
		Distance: number;
		Position: Vector3;
		Normal: Vector3;
		Material: Enum.Material;
	}

	interface SquashString {
		(this: void): SerDes<string>;

		/** Converts a string, treated as a number in base `inAlphabet`, to a number in base `toAlphabet`.  */
		convert(this: void, str: string, inAlphabet: Alphabet, toAlphabet: Alphabet): string;

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

	type AnySerDes = SerDes<any> | TupleSerDes<any> | BoolSerDes;

	type Unpack<T> = {
		[K in keyof T]: T[K] extends SerDes<infer U>
			? U
			: T[K] extends BoolSerDes
			? boolean
			: never;
	};

	type SerDes<T, U = T> = {
		/** @hidden @deprecated */
		readonly _nominal_serDes: unique symbol;

		ser(this: void, cursor: Cursor, value: T): void;
		des(this: void, cursor: Cursor): U;
	}

	type TupleSerDes<T extends Array<any>> = {
		/** @hidden @deprecated */
		readonly _nominal_tupleSerDes: unique symbol;

		ser(this: void, cursor: Cursor, ...values: T): void;
		des(this: void, cursor: Cursor): LuaTuple<T>;
	}

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
			b7?: boolean
		): void;
		des(this: void, cursor: Cursor): LuaTuple<[boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean]>;
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

	export function buffer(): SerDes<buffer>;
}

// Datatypes
declare namespace Squash {
	export function Axes(): SerDes<Axes>;

	export function BrickColor(): SerDes<BrickColor>;

	export function EnumItem<T extends Enum>(Enum: T): SerDes<T["GetEnumItems"] extends () => Array<infer U> ? U : never>;

	export function CatalogueSearchParams(): SerDes<CatalogSearchParams>;

	export function CFrame(positionSerDes: SerDes<number>): SerDes<CFrame>;

	export function Color3(): SerDes<Color3>;

	export function ColorSequenceKeypoint(): SerDes<ColorSequenceKeypoint>;

	export function ColorSequence(): SerDes<ColorSequence>;

	export function DateTime(): SerDes<DateTime>;

	export function Faces(): SerDes<Faces>;

	export function FloatCurveKey(): SerDes<FloatCurveKey>;

	export function Font(): SerDes<Font>;

	export function NumberRange(serdes: SerDes<number>): SerDes<NumberRange>;

	export function NumberSequenceKeypoint(serdes: SerDes<number>): SerDes<NumberSequenceKeypoint>;

	export function NumberSequence(serdes: SerDes<number>): SerDes<NumberSequence>;

	export function OverlapParams(): SerDes<OverlapParams>;

	export function RaycastParams(): SerDes<RaycastParams>;

	export function Vector3(serdes: SerDes<number>): SerDes<Vector3>;

	export function PathWaypoint(serdes: SerDes<number>): SerDes<PathWaypoint>;

	export function PhysicalProperties(): SerDes<PhysicalProperties>;

	export function Ray(serdes: SerDes<number>): SerDes<Ray>;

	/** Returns a `SquashRaycastResult` because Roblox does not allow instantiating RaycastResults. */
	export function RaycastResult(serdes: SerDes<number>): SerDes<RaycastResult, SquashRaycastResult>;

	export function Vector2(serdes: SerDes<number>): SerDes<Vector2>;

	export function Rect(serdes: SerDes<number>): SerDes<Rect>;

	export function Region3(serdes: SerDes<number>): SerDes<Region3>;

	export function Region3int16(): SerDes<Region3int16>;

	export function RotationCurveKey(positionSerDes: SerDes<number>): SerDes<RotationCurveKey>;

	export function TweenInfo(): SerDes<TweenInfo>;

	export function UDim(serdes: SerDes<number>): SerDes<UDim>;

	export function UDim2(serdes: SerDes<number>): SerDes<UDim2>;

	export function Vector2int16(): SerDes<Vector2int16>;

	export function Vector3int16(): SerDes<Vector3int16>;
}

// Misc
declare namespace Squash {
	export function vlq(): SerDes<number>;

	export function angle(): SerDes<number>;
}

// Data structures
declare namespace Squash {
	export function array<T>(serDes: SerDes<T>): SerDes<T[]>;

	export function map<K, V>(keySerDes: SerDes<K>, valueSerDes: SerDes<V>): SerDes<Map<K, V>>;

	export function record<T extends Record<string, AnySerDes>>(schema: T): SerDes<Reconstruct<ExcludeMembers<Unpack<T>, never>>>;

	export function tuple<T extends Array<AnySerDes>>(...values: T): TupleSerDes<Unpack<T>>;
}

export = Squash;
