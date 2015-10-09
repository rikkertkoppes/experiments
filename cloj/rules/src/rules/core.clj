(ns rules.core
  (:gen-class))

(defn rule
    "creates a rule, which is a replacement function"
    [pattern replacement]
    #(clojure.string/replace % pattern replacement))

(defn applier
    "creates a function that applies rules to a given input until it no longer changes"
    [rules]
    (defn applyRules
        "applies rules once"
        [input]
        (let [res (reduce (fn [sofar rule]
                              (rule sofar))
                          input
                          rules)]
             (if (= res input)
                 res
                 (recur res)))))

(defn -main
  "rule definition and examples"
  [& args]
  (def rules [
    ; incrementing
    (rule #"inc\(\)" "1")
    (rule #"inc\((\d*)0\)" "$11")
    (rule #"inc\((\d*)1\)" "$12")
    (rule #"inc\((\d*)2\)" "$13")
    (rule #"inc\((\d*)3\)" "$14")
    (rule #"inc\((\d*)4\)" "$15")
    (rule #"inc\((\d*)5\)" "$16")
    (rule #"inc\((\d*)6\)" "$17")
    (rule #"inc\((\d*)7\)" "$18")
    (rule #"inc\((\d*)8\)" "$19")
    (rule #"inc\((\d*)9\)" "inc($1)0")
    ; decrementing
    (rule #"dec\(0\)" "NaN")
    (rule #"dec\((\d+)0\)" "dec($1)9")
    (rule #"dec\((\d*)1\)" "$10")
    (rule #"dec\((\d*)2\)" "$11")
    (rule #"dec\((\d*)3\)" "$12")
    (rule #"dec\((\d*)4\)" "$13")
    (rule #"dec\((\d*)5\)" "$14")
    (rule #"dec\((\d*)6\)" "$15")
    (rule #"dec\((\d*)7\)" "$16")
    (rule #"dec\((\d*)8\)" "$17")
    (rule #"dec\((\d*)9\)" "$18")
    ; remove leading 0
    (rule #"0*(\d+)" "$1")
    ; addition
    (rule #"add\((\d+),0\)" "$1")
    (rule #"add\((\d+),(\d+)\)" "add(inc($1),dec($2))")
    (rule #"(\d+)\s*\+\s*(\d+)" "add($1,$2)")
    ; subtraction
    (rule #"sub\((\d+),0\)" "$1")
    (rule #"sub\((\d+),(\d+)\)" "sub(dec($1),dec($2))")
    (rule #"(\d+)\s*\-\s*(\d+)" "sub($1,$2)")
  ])
  (println ((applier rules) "10 - 5 + 3"))
  (println ((applier rules) "7 - 3"))
  (println ((applier rules) "inc(10)")))
