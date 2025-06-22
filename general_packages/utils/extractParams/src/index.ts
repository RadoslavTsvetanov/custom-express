type ContainsAtTheEnd<T extends string, Y extends string> = T extends `${infer Rest}${Y}` ? true : false;

type k = ContainsAtTheEnd<"koko$", "$">  extends true ? number : string;




type Alphabet = 
  | "a" | "b" | "c" | "d" | "e" | "f" | "g"
  | "h" | "i" | "j" | "k" | "l" | "m" | "n"
  | "o" | "p" | "q" | "r" | "s" | "t" | "u"
  | "v" | "w" | "x" | "y" | "z"
  | "A" | "B" | "C" | "D" | "E" | "F" | "G"
  | "H" | "I" | "J" | "K" | "L" | "M" | "N"
  | "O" | "P" | "Q" | "R" | "S" | "T" | "U"
  | "V" | "W" | "X" | "Y" | "Z";

type RemoveNonAlphabetic<S extends string> =
  S extends `${infer First}${infer Rest}`
    ? First extends Alphabet
      ? `${First}${RemoveNonAlphabetic<Rest>}`
      : RemoveNonAlphabetic<Rest>
    : "";



export type ExtractParams<
  T extends string,
  ReturnType extends Record<string, string> = {}
> = T extends `/${infer CurrentParam}`
  ? CurrentParam extends `:${infer ParamName}`
    ? ParamName extends `${infer Param}/${infer Rest}`
      ? ExtractParams<
      `/${Rest}`,
       { 
        [P in Param as RemoveNonAlphabetic<P>]: 
        ContainsAtTheEnd<Param,  "$"> extends true 
          ? number 
          : ContainsAtTheEnd<Param, "("> extends true 
            ? Date 
            : ContainsAtTheEnd<Param, "^"> extends true 
              ? boolean 
              : string }
           & 
        { [P in keyof ReturnType]: ReturnType[P]}>
      : {[P in keyof ReturnType]: ReturnType[P]} & {[p in ParamName]: string} 
    : CurrentParam extends `${infer NotDynamicParam}/${infer Rest}`
      ? ExtractParams<`/${Rest}`, ReturnType>
      : ReturnType
  : never 


type j = ExtractParams<"/koko/lolo/userId/:product^/:koko/lolo/:lolo$/popo/:kiki">;

export function extractParams<T extends string>(path: T): ExtractParams<T> {
    return {} as ExtractParams<T>;
}