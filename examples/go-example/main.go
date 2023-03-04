package main

//See https://github.com/lspaccatrosi16/fingo.js/#readme for detailed documentation

import (
  _ "embed"
	"encoding/json"
  "fmt"
  )

//go:embed fingo.json
var fingoJSON []byte

type PACKAGE struct {
	Name    string `json:"name"`
	Version string `json:"version"`
  Data CUSTOMDATA `json:"data"`
}

type CUSTOMDATA struct {
  Foo string `json:"foo"`
}

func main() {
    var fingo PACKAGE
    json.Unmarshal(fingoJSON, &fingo)

    fmt.Printf("Hello world from %s v%s\n", fingo.Name, fingo.Version)
    fmt.Println(fingo.Data.Foo)
}