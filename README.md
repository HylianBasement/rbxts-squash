# `Squash`
Typings for [squash](https://github.com/Data-Oriented-House/Squash/), a Roblox Ser/Des library.

The examples have been simplified to only show what's necessary. If you are seeking for a more deep understanding of how the library works, consider reading the [original documentation](https://data-oriented-house.github.io/Squash/docs/intro) for complete info.

## Installation
Simply execute the command below to install it to your roblox-ts project.
```bash
npm i @rbxts/squash
```

## Usage
Squash can be either imported as a namespace or destructured. Below are some examples with roblox-ts. Some members should not be destructured because they conflict with existing globals, such as the `string` library and data types.
```ts
import Squash from "@rbxts/squash";
import { number, uint, int, boolean, ... } from "@rbxts/squash";
```

The `T` function is intentionally omitted from the typings because TypeScript can infer type arguments and map the schema type into its unpacked version using conditional typing.

### Booleans
In Luau, the `boolean` type is 1 byte large, but only 1 bit is actually necessary to store the contents of a boolean. This means we can actually serialize not just 1, but 8 booleans in a single byte. This is a common strategy called *bit-packing* to implement [*bit-fields*](https://en.wikipedia.org/wiki/Bit_field).

```ts
const cursor = Squash.cursor();

Squash.boolean().ser(cursor, true);
Squash.print(cursor); // { Len: 8, Pos: 1, Buf: { 1 0 0 0 0 0 0 0 } }

print(Squash.boolean().des(cursor)); // true false false false false false false false
```

```ts
const cursor = Squash.cursor(3);

Squash.boolean().ser(cursor, true, false, true, false, true, true, false, true);
Squash.print(cursor); // { Len: 3, Pos: 1, Buf: { 181 0 0 } }

print(Squash.boolean().des(cursor)); // true false true false true true false true
```

### Unsigned Integers
Unsigned integers are whole numbers that can be serialized using 1 to 8 bytes.

```ts
const cursor = Squash.cursor();

Squash.uint(1).ser(cursor, 243)
print(Squash.uint(1).des(cursor)) // 243
```

```ts
Squash.uint(1).ser(cursor, -13)
print(Squash.uint(1).des(cursor)) // 243
```

> Using 7 or 8 bytes puts uints outside the 52 bit range of representation, leading to inaccurate results.

### Signed Integers
Signed Integers are Integers that can be serialized with 1 through 8 bytes:

```ts
const cursor = Squash.cursor();

Squash.int(1).ser(cursor, 127)
print(Squash.int(1).des(cursor)) // 127
```

```ts
Squash.int(1).ser(cursor, -127)
print(Squash.int(1).des(cursor)) // -127
```

```ts
Squash.int(1).ser(cursor, 128)
print(Squash.int(1).des(cursor)) // -128
```

```ts
Squash.int(1).ser(cursor, -128)
print(Squash.int(1).des(cursor)) // -128
```

> Using 7 or 8 bytes puts ints outside the 52 bit range of representation, leading to inaccurate results.

### Floating Point
Floating Point Numbers are Rational Numbers that can be represented with either 4 or 8 bytes:

```ts
const cursor = Squash.cursor();

Squash.number(4).ser(cursor, 174302.923957475339573)
print(Squash.number(4).des(cursor)) // 174302.921875
```

```ts
Squash.number(8).ser(cursor, -17534840302.923957475339573)
print(Squash.number(8).des(cursor)) // 17534840302.923958
```

### Strings
```ts
const cursor = Squash.cursor();
Squash.string().ser(cursor, "Hello, World!");
Squash.print(cursor);
// Pos: 14 / 18
// Buf: { 72 101 108 108 111 44 32 87 111 114 108 100 33 141 0 0 0 0 }
//                                                           ^
print(Squash.string().des(cursor))
// Hello, World!
```

Strings come in many different flavors though, so we need to know how to serialize each flavor. Each string is composed of a sequence of certain characters. The set of those certain characters is called that string's smallest **Alphabet**.

```ts
const x = 'Hello, world!';
const alphabet = Squash.string.alphabet(x);
print(alphabet);
//  !,Hdelorw
const y = Squash.string.convert(x, alphabet, Squash.string.utf8);
print(y)
// >q#�
print(Squash.string.convert(y, Squash.string.utf8, alphabet));
// 'Hello, world!'
```

```ts
const y = Squash.string.convert('123', Squash.string.decimal, Squash.string.binary);
print(y);
// 1111011
print(Squash.string.convert(y, Squash.string.binary, Squash.string.octal));
// 173
print(Squash.string.convert(y, Squash.string.binary, Squash.string.decimal));
// 123
print(Squash.string.convert(y, Squash.string.binary, Squash.string.duodecimal));
// A3
print(Squash.string.convert(y, Squash.string.binary, Squash.string.hexadecimal));
// 7B
print(Squash.string.convert(y, Squash.string.binary, Squash.string.utf8));
// {
```

### Arrays
Arrays are a classic table type `T[]`. Like strings, which are also arrays (of bytes), after serializing every element in sequence we append a VLQ representing the count. An array can store an array or any other table type.

```ts
const arr = Squash.array;
const float = Squash.number(4);
const myarr = arr(float);

const cursor = Squash.cursor();
myarr.ser(cursor, [1, 2, 3, 4, 5.5, 6.6, -7.7, -8.9, 10.01]);
Squash.print(cursor);
// Pos: 37 / 40
// Buf: { 0 0 128 63 0 0 0 64 0 0 64 64 0 0 128 64 0 0 176 64 51 51 211 64 102 102 246 192 102 102 14 193 246 40 32 65 137 0 0 0 }
//                                                                                                                         ^
print(myarr.des(cursor))
// 1 2 3 4 5.5 6.599999904632568 -7.699999809265137 -8.899999618530273 10.01000022888184
```

### Maps
Maps are a classic table type `Map<K, V>` that map K's to V's. A map can store a map or any other table type.

```ts
const u = Squash.uint;
const vec3 = Squash.Vector3;
const vec2 = Squash.Vector2;
const myMap = Squash.map(vec2(u(2)), vec3(u(3)));

const cursor = Squash.cursor();

myMap.ser(cursor, new Map([
    [new Vector2(1, 2), new Vector3(1, 2, 3)],
    [new Vector2(4, 29), new Vector3(4, 29, 33)],
    [new Vector2(72, 483), new Vector3(72, 483, 555)],
]));
Squash.print(cursor);
// Pos: 40 / 40
// Buf: { 43 2 0 227 1 0 72 0 0 227 1 72 0 33 0 0 29 0 0 4 0 0 29 0 4 0 3 0 0 2 0 0 1 0 0 2 0 1 0 131   }
//                                                                                                    ^
print(myMap.des(cursor));
// {
//    [Vector2(24346692898)] = 72, 483, 555,
//    [Vector2(243466928B0)] = 4, 29, 33,
//    [Vector2(243466928C8)] = 1, 2, 3
// }
```

### Records
Records (Structs) `{ prop1: any, prop2: any, ... }` map enumerated string identifiers to different values, like a named tuple. Because all keys are string literals known ahead of time, none of them have to be serialized! A record can store a record or any other table type.

```ts
const u = Squash.uint;
const vlq = Squash.vlq();
const bool = Squash.boolean();
const str = Squash.string();
const float = Squash.number(4);
const vec2 = Squash.Vector2;
const arr = Squash.array;
const map = Squash.map;
const record = Squash.record;

const playerSerdes = record({
    position: vec2(float),
    health: u(1),
    name: str,
    poisoned: bool,
    items: arr(record({
        count: vlq,
        name: str,
    })),
    inns: map(
        str,
        bool
    ),
});

const cursor = Squash.cursor();
playerSerdes.ser(cursor, {
    position: new Vector2(287.3855, -13486.3),
    health: 9,
    name: "Cedrick",
    poisoned: true,
    items: {
        { name = 'Lantern', count = 2 },
        { name = 'Waterskin', count = 1 },
        { name = 'Map', count = 4 },
    },
    inns: {
        ['The Copper Cauldron']: true,
        Infirmary: true,
        ['His Recess']: true,
    },
});

Squash.print(cursor);
// Pos: 89 / 90
// Buf: { 9 1 72 105 115 32 82 101 99 101 115 115 138 1 84 104
// 101 32 67 111 112 112 101 114 32 67 97 117 108 100 114 111
// 110 147 1 73 110 102 105 114 109 97 114 121 137 131 130 76
// 97 110 116 101 114 110 135 129 87 97 116 101 114 115 107 105
// 110 137 132 77 97 112 131 131 67 101 100 114 105 99 107 135
// 1 51 185 82 198 88 177 143 67 0 }

print(playerSerdes.des(cursor));
// {
//     ["health"] = 9,
//     ["inns"] =  ▼  {
//         ["His Recess"] = true,
//         ["Infirmary"] = true,
//         ["The Copper Cauldron"] = true
//     },
//     ["items"] =  ▼  {
//         [1] =  ▼  {
//             ["count"] = 2,
//             ["name"] = "Lantern"
//         },
//         [2] =  ▼  {
//             ["count"] = 1,
//             ["name"] = "Waterskin"
//         },
//         [3] =  ▼  {
//             ["count"] = 4,
//             ["name"] = "Map"
//         }
//     },
//     ["name"] = "Cedrick",
//     ["poisoned"] = true,
//     ["position"] = 287.385498, -13486.2998
// }
```

### Tuples
Tuple types `LuaTuple<T>` are like arrays but without the table part, and each element can be a different type. Tuples cannot be used in table types, and cannot be nested in other tuples.

```ts
const S = Squash;

const myTuple = S.tuple(
    S.Vector3(S.number(8)),
    S.CFrame(S.int(1)),
    S.BrickColor(),
    S.EnumItem(Enum.HumanoidStateType)
);

const cursor = S.cursor();
myTuple.ser(cursor, new Vector3(123456789, 1, 0), new CFrame(1, 2, 3), new BrickColor(93), Enum.HumanoidStateType.Freefall);
S.print(cursor);
// Pos: 40 / 40
// Buf: { 0 0 0 0 0 0 0 0 0 0 0 0 0 0 240 63 0 0 0 96 52 111 157 65 1 0 0 64 64 0 0 0 64 0 0 128 63 194 0 134   }
//                                                                                                            ^
print(myTuple.des(cursor));
// 123456792, 1, 0 1, 2, 3, 1, 0, 0, 0, 1, 0, 0, 0, 1 Medium stone grey Enum.HumanoidStateType.Freefall
```