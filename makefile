

GO_COMPILER ?= go # tinygo

# I would put this on the serve rule, but it doesn't
# work if its part of a thread? for some reason?
#
# I swear im gonna move to nob.h at some point.
full_watch: boid.wasm supply_wasm_exec
	make -j 3 npm-watch serve go-watch


boid.wasm:
	GOOS=js GOARCH=wasm $(GO_COMPILER) build -C ./go_boid_stuff/ -o ../dist/boid.wasm

boid.wat:
	wasm2wat dist/boid.wasm > dist/boid.wat


npm_install:
	npm install

npm-watch: boid.wasm npm_install
	npm run watch

# TODO we might as well just get these from there respective compilers
# TODO this is non exhaustive.
supply_wasm_exec:
	if [ $(GO_COMPILER) = go ]; then                             \
		ln -fsr ./web_src/wasm_exec.js      ./dist/wasm_exec.js; \
	else                                                         \
		ln -fsr ./web_src/wasm_exec_tiny.js ./dist/wasm_exec.js; \
	fi

serve:
	npm run serve
# 	this cuts down on the python dependency.
# 	python3 -m http.server 8080

go-watch: npm_install
#   we rely on npm to have nodemon
#   this dose mean we cant have more than these 2 compilers for now...
#   i blame npm
	if [ $(GO_COMPILER) = go ]; then            \
		npm run "watch_go_boid_stuff go";       \
	else                                        \
		npm run "watch_go_boid_stuff tinygo";   \
	fi
