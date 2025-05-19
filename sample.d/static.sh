#!/bin/sh

port=51980
pubd=./public.d
addr=127.0.0.1

miniserve \
	--port ${port} \
	--interfaces "${addr}" \
	"${pubd}"
