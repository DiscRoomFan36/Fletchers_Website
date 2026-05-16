
# TODO replace with build.go or something.

GO_COMPILER ?= go # tinygo

# I would put this on the serve rule, but it doesn't
# work if its part of a thread? for some reason?
#
# I swear im gonna move to nob.h at some point.
full_watch: boid.wasm supply_wasm_exec
	make -j 3 watch_go_files serve_boid serve_personal_website


boid.wasm:
	GOOS=js GOARCH=wasm $(GO_COMPILER) build -C ./go_boid_stuff/ -o ../dist/boid.wasm

boid.wat:
	wasm2wat dist/boid.wasm > dist/boid.wat


watch_go_files: boid.wasm
	./watch_script.sh


# TODO we might as well just get these from there respective compilers
# TODO this is non exhaustive.
supply_wasm_exec:
	if [ $(GO_COMPILER) = go ]; then                             \
		ln -fsr ./wasm_exec.js      ./dist/wasm_exec.js; 		 \
	else                                                         \
		ln -fsr ./web_src/wasm_exec_tiny.js ./dist/wasm_exec.js; \
	fi


serve_boid:
	python3 -m http.server 8080

serve_personal_website:
	python3 -m http.server 8081 --directory ./temp_html_site
