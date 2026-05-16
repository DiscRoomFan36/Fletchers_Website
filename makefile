
# TODO replace with build.go or something.

GO_COMPILER ?= go # tinygo

# this makes a page for both the boids and the personal
# website. although the website doesn't actually need
# the boids to be served.
full_watch_website_and_boids: boid.wasm supply_wasm_exec
	make -j 3 watch_go_files serve_boid serve_personal_website

# this one just makes the website.
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


serve_boid:
	python3 -m http.server 8080 --directory ./boid_sim

serve_personal_website:
	python3 -m http.server 8081
