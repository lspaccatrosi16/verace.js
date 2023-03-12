package main

import (
	"fmt"
	"os"
	"path/filepath"
)

func main() {
	args := os.Args

	if len(args) < 2 {
		fmt.Println("Must provide a target: either win64 or linux64")
		os.Exit(1)
	}

	target := args[1]

	if target == "linux64" {
		copyFile("cjs-transpile")
	} else if target == "win64" {
		copyFile("cjs-transpile.exe")

	} else {
		fmt.Printf("Target invalid: %s. Must be either win64 or linux64", target)
		os.Exit(1)
	}
}

func copyFile(name string) {
	os.RemoveAll("assets")
	wd, _ := os.Getwd()

	path := filepath.Join(wd, "tools", name)

	ford, err := os.Stat(path)

	if err != nil {
		if os.IsNotExist(err) {
			fmt.Printf("Could not find path %s", path)
			os.Exit(1)
		} else {
			fmt.Println(err)
			os.Exit(1)
		}
	}

	if ford.IsDir() {
		fmt.Printf("%s is a dir. Must be a file", path)
		os.Exit(1)
	}

	contents, err := os.ReadFile(path)

	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	os.Mkdir("assets", 0777)

	newPath := filepath.Join(wd, "assets", name)

	err = os.WriteFile(newPath, contents, 0777)

	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

}
