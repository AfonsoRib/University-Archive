type 'a tree = Nil | Node of 'a * 'a tree * 'a tree ;;
type 'a ntree = NNil | NNode of 'a * 'a ntree list ;;

let rec length l =
  match l with
  |[] -> 0
  |x::t -> 1+length t

let rec howMany v t =
  match t with
  | Nil -> 0
  | Node(x,l,r) -> howMany v l + howMany v r + (if v = x then 1 else 0)

let rec eqPairs t =
  match t with
  | Nil -> 0
  | Node((a,b),l,r) -> eqPairs l + eqPairs r + (if a = b then 1 else 0)

let rec treeToList t =
  match t with
  | Nil -> []
  | Node(x,l,r) -> x::treeToList l @ treeToList r

let rec height t =
    match t with
       Nil -> 0
     | Node(x,l,r) ->
           1 + max (height l) (height r)

let rec balanced t =
  match t with
  |Nil -> true
  |Node(x,l,r) -> balanced l && balanced r && height l - height r <= 1

let rec spring v t =
  match t with
  | Nil -> Node(v, Nil, Nil)
  |Node(x,l,r) -> Node (x, spring v l, spring v r)

let rec fall v t =
  match t with
  | Nil -> Nil
  | Node(x, Nil,Nil) -> Nil
  | Node (x,l,r) -> Node (x, fall v l, fall v r)

let rec nTreeList t =
  match t with
  | NNil -> []
  | NNode (x, cs) -> x::lnTreeList cs
and lnTreeList tl =
  match tl with
  | [] -> []
  | h::t ->  nTreeList h  @  lnTreeList t

(* não está a funcionar *)

(* let rec nFall t = *)
(*   match t with *)
(*   | NNil -> [] *)
(*   | NNode (x, []) -> NNil *)
(*   | NNode (x, cs) -> NNode (x,lnFall cs) *)
(* and lnFall tl = *)
(*   match tl with *)
(*   | [] -> [] *)
(*   | h::t ->  nFall h::lnFall t  *)
