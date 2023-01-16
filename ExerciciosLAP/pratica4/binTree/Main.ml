open BinTree  (* Abre o modulo das árvores *)

(* Método indutivo aplicado a strings. A função cut "separa a cabeça da cauda", numa string. *)
let cut s =  (* pre: s <> "" *)
    (String.get s 0, String.sub s 1 ((String.length s)-1))

(* Método indutivo aplicado a strings. A função join adiciona um char à cabeça numa string. *)
let join x xs =
    (Char.escaped x)^xs

let rec split s =                      (* parte a string s no primeiro ' ' e produz um par ordenado de strings *)
    if s = "" then ("", "")            (* primeiro caso base *)
    else
      let (x,xs) = cut s in            (* separa cabeça da cauda *)
         if x = ' ' then ("", xs)      (* segundo caso base *)
         else let (a,b) = split xs in  (* caso geral - chamada recursiva para a cauda *)
             (join x a, b)

let help () =
    print_string "Comandos validos:\n" ;
    print_string "    mostra fich\n" ;
    print_string "    maximo fich\n" ;
    print_string "    ajuda\n" ;
    print_string "    sair\n"

let byeBye () =
    print_string "Ate' `a vista!\n";
    exit 0

let exec comm filename = (* falta apenas completar esta funcao *)
    match comm with
      | "mostra" -> ()
      | "maximo" ->  let t = load filename in
                     if empty t Nil then print_string "Tree is empty\n";
                     print int (max t); print_newline()
      | "ajuda" -> help ()
      | "sair" -> byeBye ()
      | _ -> help ()

let error mesg =
    output_string stderr mesg ;
    output_string stderr "!\n" ;
    flush stderr

let rec main () = (* ciclo de interpretacao *)
    (try
        print_string "> " ;
        let line = read_line () in
            let (comm, fileName) = split line in
               exec comm fileName
    with
     | End_of_file -> byeBye ()
     | Sys_error str -> error str
     | _ -> error "Erro") ;
    main ()
;;

main ()  (* Esta linha faz o programa começar a correr aqui *)
