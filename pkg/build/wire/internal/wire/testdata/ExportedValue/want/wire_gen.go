// Code generated by Wire. DO NOT EDIT.

//go:generate go run ./pkg/build/wire/cmd/wire/main.go
//go:build !wireinject

package main

import (
	"example.com/bar"
)

// Injectors from wire.go:

func injectedMessage() string {
	string2 := _wireStringValue
	return string2
}

var (
	_wireStringValue = bar.PublicMsg
)
