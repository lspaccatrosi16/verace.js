package main

//See https://github.com/lspaccatrosi16/verace.js/#readme for detailed documentation

import (
  _ "embed"
	"encoding/json"
  "fmt"
  )

//go:embed verace.json
var veraceJSON []byte

type PACKAGE struct {
	Name    string `json:"name"`
	Version string `json:"version"`
  Data CUSTOMDATA `json:"data"`
}

type CUSTOMDATA struct {
  Foo string `json:"foo"`
}

func main() {
    var verace PACKAGE
    json.Unmarshal(veraceJSON, &verace)

    fmt.Printf("Hello world from %s v%s\n", verace.Name, verace.Version)
    fmt.Println(verace.Data.Foo)
}