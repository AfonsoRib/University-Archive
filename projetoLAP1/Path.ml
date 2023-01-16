(* Path module body *)
(* LAP (AMD 2022) *)

(* 
   Student 1: ????? mandatory to fill
   Student 2: ????? mandatory to fill

   Comment:

   ?????????????????????????
   ?????????????????????????
   ?????????????????????????
   ?????????????????????????
   ?????????????????????????
   ?????????????????????????

 *)

(*
  0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789
  100 columns
 *)


(* COMPILATION - How Mooshak builds this module:
   ocamlc -c Path.mli Path.ml
 *)



(* AUXILIARY GENERAL FUNCTIONS - you can add more *)

let rec clean l =
  match l with
  | [] -> []
  | [x] -> [x]
  | x::y::xs ->
     if x = y then clean (y::xs)
     else x::clean (y::xs)

let unique l = (* removes duplicates *)
  clean (List.sort compare l)

let length =
  List.length

let map =
  List.map

let filter =
  List.filter

let mem =
  List.mem

let flatMap f l =
  List.flatten (map f l)

let partition =
  List.partition

let exists =
  List.exists

let for_all =
  List.for_all

let union l1 l2 =
  clean (l1 @ l2)

let inter l1 l2 =
  filter (fun x -> mem x l2) l1

let diff l1 l2 =
  filter (fun a -> not (mem a l2)) l1

let tail =
  List.tl

let head =
  List.hd

(* TYPES & CONSTANTS *)

type point = int * int
type path = point list

let _NO_PATH = []



(* SOME EXAMPLES - you can add more *)

let example1 = [
    (0,0); (0,1); (0,2);
    (1,2); (2,2); (2,1);
    (2,0); (1,0)
  ]

let example2 = [
    (0,0); (0,1); (0,2);
    (1,2); (2,2); (2,1);
    (2,0); (1,0); (0,0)
  ]

let example3 = [
    (2,2); (2,3); (2,4); (2,5);
    (3,5); (4,5); (5,5); (6,5);
    (5,4); (4,3); (3,2); (2,1);
    (1,0); (1,1); (1,2); (2,3);
    (3,4); (4,5); (5,6); (6,7)
  ]

let example4 = [
    (1,1); (2,1); (3,1); (4,1);
    (1,2); (2,2); (3,2); (4,2);
    (1,3); (2,3); (3,3); (4,3);
    (1,4); (2,4); (3,4); (4,4)
  ]

let example5 = [
    (0,4); (1,4); (2,4); (3,4); (4,4); (5,4); (6,4);
    (4,0); (4,1); (4,2); (4,3); (4,4); (4,5); (4,6);
    (0,0); (1,1); (2,2); (3,3); (4,4); (5,5); (6,6);
    (0,8); (1,8); (2,8); (2,9); (2,10); (1,10); (0,10); (0,9); (0,8)
  ]

let example6 = [
    (0,0); (0,1); (0,2); (0,3); (0,3); (0,4); (0,5); (0,7); (0,8)
  ]



(* BASIC PATH FUNCTIONS - you can add more *)

(* Adjacent points? *)
let areAdjacent (x1, y1) (x2, y2) =
  abs(x2 - x1) <= 1 && abs(y2 - y1) <= 1

(* Are two points the same? *)
let areSame a b =
  a = b

(* Adjacent distinct points? *)
let areAdjacentDistinct a b =
  areAdjacent a b && not (areSame a b)

let rec last p =
  head (List.rev p)

let isClosed p =
  match p with
  |[] -> false
  |[x] -> false
  |h::t -> h = last p


(* FUNCTION makeSegment *)

let step x1 x2 =
  if x1 = x2 then
    x1
  else if x1 > x2 then
    x1 - 1
  else x1 + 1

let rec makeSegment a b =
  match a,b with
  | (x1,y1), (x2,y2) -> 
     
     if a <> b then
       a::makeSegment((step x1 x2) ,(step y1 y2)) b
     else
       [b]

(* FUNCTION isContinuous *)

let rec isContinuous p =
  match p with
  | [] -> false
  | [x] -> true
  | h::h2::t -> areAdjacentDistinct h h2 && isContinuous (h2::t)


(* FUNCTION intersections *)

(*adiciona todos os elementos repetidos ao longo da tail a uma lista*)
let rec intersectionsAux p =
  match p with
  | [] -> []
  | h::t -> if mem h t then h::intersectionsAux t else intersectionsAux t

let intersections p = unique (intersectionsAux p)

(* FUNCTION isSegment *)
let isSegment p = if isClosed p then
                    head p = last p && length (intersections p) = 1 && isContinuous p
                  else
                    intersections p = [] && isContinuous p


(* FUNCTION segments *)

(*separa os pontos nas intersecoes e descontinuidades*)
let sepDiscInters point p inters =
  match p with
  | [] -> [[point]]
  | h::t ->
     let listHead = (head h) in
     if (not (areAdjacentDistinct point listHead)) ||
          (mem listHead inters && (length h) = 1 && point = listHead)  then
       [point]::p
     else if mem listHead inters && (length h) <> 1 then
       [point;listHead]::p
     else (point::h)::t

(* aplica a funcao sepDiscInters e produz o resultado esperado*)
let rec segmentsAux p inters =
  match p with
  | [] -> []
  | h::t -> sepDiscInters h (segmentsAux t inters) inters

let segments p =
   ( (segmentsAux p (intersections p)))

(* FUNCTION interval *)
let rec interval p a b =
  if mem a p && mem b p then
    if a = b then
      if isClosed p then
        p
      else
        [b]
    else
      match p with
      | [] -> []
      | h::t -> if h = a then
                  a::(interval t (head t) b)
                else
                  interval t a b
  else []

(* FUNCTION best0 *)

(* compara todos os segmentos da lista de tras para a frente e compara-os para ver qual e menor*)
let rec best0 pp a b =
  match pp with
  | [] -> []
  | h::t -> let headInterval = (interval h a b) and tailInterval = (best0 t a b) in
            if tailInterval = [] then
              headInterval
            else if headInterval = [] then
              tailInterval
            else
              if(length headInterval) <= (length tailInterval) then
                headInterval
              else
                tailInterval

(* FUNCTION best1 *)

(* constroi todos os segmentos a partir de dois paths distintos, um que contenha a e outro que contenha b*)
let rec best1Aux aa bb  =
  match aa, bb with
  | [], [] -> []
  | [], _ -> []
  | ha::ta, hb::tb -> if (last ha) = (head hb) then
                        (ha @ (tail hb))::(best1Aux ta bb)
                      else
                        []

let best1 pp ii a b =
  let oneSegment = filter (fun x -> mem a x && mem b x) pp in
  if oneSegment <> [] then
    best0 oneSegment a b
  else
    let aa = (filter (fun x -> mem a x && mem (last x) ii) pp)
    and bb  = (filter (fun x -> mem b x && mem (head x) ii) pp) in
    if not (aa = [] || bb = []) then
      best0 (best1Aux aa bb) a b
    else
      []

(* FUNCTION best *)

(*Cria o powerset de um dado path*)
let rec power p =
  match p with
  | []    -> [[]]
  | x::xs -> let ls = power xs in
             map (fun l -> x::l) ls @ ls;;

(*cria um segmento unificado dado uma lista de paths distintos*)
let rec createSegment pp ii= 
  match pp with
  | [] -> []
  | [x] -> (tail x)
  | h::h2::t -> let hlast = (last h) and
                    h2head = head h2 in
                if hlast = h2head && mem hlast ii then
                  h @ (createSegment (h2::t) ii)
                else []

let best pp ii a b =
  if pp = [] then []
  else  let allSegments = (map (fun ll -> createSegment ll ii)  (power pp)) in
        best0 allSegments a b                         
