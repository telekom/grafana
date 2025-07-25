// Code generated by Wire. DO NOT EDIT.

//go:generate go run ./pkg/build/wire/cmd/wire/main.go
//go:build !wireinject

package main

import (
	"example.com/bar"
	"example.com/baz"
	"example.com/foo"
	"fmt"
)

// Injectors from wire.go:

func newBazService() *baz.Service {
	config := _wireConfigValue
	fooConfig := config.Foo
	service := foo.New(fooConfig)
	barConfig := config.Bar
	barService := bar.New(barConfig, service)
	bazService := &baz.Service{
		Foo: service,
		Bar: barService,
	}
	return bazService
}

var (
	_wireConfigValue = &baz.Config{
		Foo: &foo.Config{1},
		Bar: &bar.Config{2},
	}
)

// wire.go:

func main() {
	svc := newBazService()
	fmt.Println(svc.String())
}
