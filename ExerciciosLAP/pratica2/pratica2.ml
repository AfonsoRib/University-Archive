(* Cortesia do Guilherme Figueira *)

let rec belongs x l=
  match l with
  | [] -> false
  | v::t -> x=v || belongs x t
;;

let rec union l1 l2=
  match l1 with
  | [] -> l2
  | v::t -> v :: union t l2
;;

let rec inter l1 l2=
  match l1 with
  | [] -> []
  | v::t -> if belongs v l2 then v::inter t l2 else inter t l2
;;

let rec diff l1 l2=
  match l1 with
  | [] -> []
  | v::t -> if belongs v l2 then diff t l2 else v::diff t l2
;;

let rec power l=
  match l with
  | [] -> [[]]
  | v::t -> [v]::power t
;;

let rec nat n=
  if n = 0 then []
  else (n-1)::(nat (n-1))
;;


let rec pack l =
  match l with
  | [] -> failwith "lista vazia"
  | [x] -> [(x,1)]
  | h::t -> let valor = (pack t) in
            match valor with
            | [] -> failwith "lista vazia"
            | h2::t2 -> match h2 with
                        | (x,y) -> if (compare h x) == 0 then (x,y+1)::t2 else (h, 1)::valor

let rec unpack l =
  match l with
  | [] -> []
  | h::t -> match h with
            | (x,y) -> match y with
                       | 1 -> x::(unpack t)
                       | _ -> x::(unpack ((x,y-1)::t))

let rec combinations k l=
  if k <= 0 then [[]]
  else match l with
       | [] -> []
       | h::t -> let with_h = List.map (fun l -> h :: l) (combinations (k - 1) t) in
                 let without_h = combinations k t in
                 with_h @ without_h
