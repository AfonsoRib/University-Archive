let rec clearAux ic oc =
  let line = input_line ic in
  (try
     if compare line "" == 0 then
       clearAux ic oc
     else
       output_string oc (line ^ "\n"); clearAux ic oc
   with
   | End_of_file -> close_out oc)


let clear readfile writefile =
  let ic = open_in readfile and oc = open_out writefile in
  clearAux ic oc;
  close_in ic
