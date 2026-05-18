
# TODO replace with build.go or something.

GO_COMPILER ?= go # tinygo

# to access the website, go to localhost:8080
#
# to access the boid sim, go to localhost:8080/boid_sim
# yes it is that easy.
serve_and_hotreload_website: boid.wasm supply_wasm_exec
	make -j 2 watch_go_files serve_personal_website


boid.wasm:
	GOOS=js GOARCH=wasm $(GO_COMPILER) build -C ./boid_sim/go_boid_stuff/ -o ../dist/boid.wasm

boid.wat:
	wasm2wat ./boid_sim/dist/boid.wasm > ./boid_sim/dist/boid.wat


watch_go_files: boid.wasm
	./boid_sim/watch_script.sh


# TODO we might as well just get these from there respective compilers
# TODO this is non exhaustive.
supply_wasm_exec:
	if [ $(GO_COMPILER) = go ]; then                             \
		ln -fsr ./boid_sim/wasm_exec.js      ./boid_sim/dist/wasm_exec.js; 		 \
	else                                                         \
		ln -fsr ./boid_sim/wasm_exec_tiny.js ./boid_sim/wasm_exec.js; \
	fi


serve_personal_website:
	python3 -m http.server 8080
