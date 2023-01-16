(* versão iterativa *)
let countEmptyLoop filename =
  let count = ref 0 in
  let ic = open_in filename in
  (try
    while true; do
      if compare (input_line ic) "" == 0 then
        count := !count + 1
    done
  with
  | End_of_file -> close_in ic);
  count
       

(* versão recursiva *)
let rec countEmptyAux ic =
  (try
    let linha = input_line ic in
    if compare linha "" == 0 then
      1 + (countEmptyAux ic) else countEmptyAux ic
  with
  | End_of_file -> close_in ic; 0)
    
let countEmpty filename =
  let ic = open_in filename in
  countEmptyAux ic
