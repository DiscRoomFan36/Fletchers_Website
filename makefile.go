package main

import (
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"slices"
	"time"
)


const WASM_FILE_PATH = "./boid_sim/dist/boid.wasm";
const WAT_FILE_PATH  = "./boid_sim/dist/boid.wat";

const BOID_SIM_GO_CODE_FOLDER = "./boid_sim/go_boid_stuff/";



type Command_Line_Flag struct {
	name string;

	function_for_command func() error;
}

var command_line_argument_flags = []Command_Line_Flag{
	{
		name: "compile_boid_sim_to_wasm",
		function_for_command: compile_boid_sim_to_wasm,
	},
	{
		name: "boid_wasm_to_wat",
		function_for_command: boid_wasm_to_wat,
	},
	{
		name: "supply_wasm_exec_file()",
		function_for_command: supply_wasm_exec_file,
	},
	{
		name: "watch_go_files",
		function_for_command: func() error { return watch_go_files(BOID_SIM_GO_CODE_FOLDER, compile_boid_sim_to_wasm); },
	},
	{
		name: "serve_personal_website",
		function_for_command: serve_personal_website,
	},
	{
		name: "serve_and_hotreload_personal_website",
		function_for_command: serve_and_hotreload_personal_website,
	},
};


func main() {
	// signal handling code.
	// TODO use this to stop things for running. might not be necessary.
	//
	// c := make(chan os.Signal);
	// signal.Notify(c, os.Kill, os.Interrupt);
	// <- c; // wait for a signal.
	// signal.Stop(c);

	args := os.Args[1:];

	// if no command given, just serve the website.
	if len(args) == 0 {
		args = append(args, "serve_and_hotreload_personal_website");
	}

	// this runs the commands in the order they were given. not a lot of error checking.
	for _, arg := range args {
		index := slices.IndexFunc(command_line_argument_flags,
			func(command Command_Line_Flag) bool { return arg == command.name; },
		);

		if index != -1 {
			command := &command_line_argument_flags[index];
			fmt.Printf("    running command '%s'\n", command.name);
			check_for_error(command.function_for_command(), command.name);
		} else {
			// no command with name
			log.Fatalf("unknown command '%s'\n", arg);
			// TODO print help message.
		}
	}
}



func compile_boid_sim_to_wasm() error {
	// GOOS=js GOARCH=wasm $(GO_COMPILER) build -C ./boid_sim/go_boid_stuff/ -o ../dist/boid.wasm
	//
	// TODO be able to switch to tinygo
	//
	// "../../" <- go compiler tries to put the output in the same folder. gotta backtrack.
	cmd := exec.Command("go", "build", "-C", "./boid_sim/go_boid_stuff/", "-o", "../../" + WASM_FILE_PATH);

	// go_has_a_bad_std moment.
	cmd.Env = append(os.Environ(), "GOOS=js", "GOARCH=wasm");

	// fmt.Println(cmd);

	output, err := cmd.CombinedOutput();
	if err != nil {
		return fmt.Errorf("could not run command '%v' for reason: %v", cmd, err);
	}

	fmt.Printf("successfully compiled go to wasm, got output: '%s'\n", string(output));
	return nil;
}

func boid_wasm_to_wat() error {
	// wasm2wat ./boid_sim/dist/boid.wasm > ./boid_sim/dist/boid.wat
	cmd := exec.Command("wasm2wat", WASM_FILE_PATH);

	wat_file, err := os.Create(WAT_FILE_PATH);
	if err != nil {
		return fmt.Errorf("Could not create new wat file: %v", err);
	}
	defer wat_file.Close();

	// pipe to wat file.
	cmd.Stdout = wat_file;

	if err := cmd.Run(); err != nil {
		return fmt.Errorf("could not run command '%v' for reason: %v", cmd, err);
	}

	fmt.Printf("successfully turned '%s' into '%s'\n", WASM_FILE_PATH, WAT_FILE_PATH);

	// fmt.Println(string(output));
	return nil;
}

func supply_wasm_exec_file() error {
	// TODO we might as well just get this from the go compiler
	//
	// TODO be able to switch compilers, (aka tinygo)
	const WASM_EXEC_SOURCE_PATH = "./boid_sim/wasm_exec.js";
	const WASM_EXEC_DEST_PATH   = "./boid_sim/dist/wasm_exec.js";

	// maybe it would be better co copy? if we got the source from the compiler.
	cmd := exec.Command("ln", "-fsr", WASM_EXEC_SOURCE_PATH, WASM_EXEC_DEST_PATH);

	output, err := cmd.CombinedOutput();
	if err != nil {
		return fmt.Errorf("could not run command '%v' for reason: %v", cmd, err);
	}

	fmt.Printf("successfully supplied wasm_exec.js, got output: '%s'\n", string(output));
	return nil;
}


// watch a folder, and trigger a function if something changed
//
// this function never returns
func watch_go_files(folder_to_watch string, function_to_call func() error) error {

	fmt.Printf("beginning watch of %s\n", folder_to_watch);

	path_to_mod_time := make(map[string]time.Time);

	for {
		something_changed := false;

		filepath.WalkDir(folder_to_watch,
			func(path string, d fs.DirEntry, err error) error {
				if err != nil { return err; }

				// we don't care about directories.
				if d.IsDir() { return nil; }

				info, err := d.Info();
				if err != nil {
					return fmt.Errorf("could not get stat for file for '%s', reason: %v", path, err);
				}

				modification_time := info.ModTime();
				if modification_time != path_to_mod_time[path] {
					path_to_mod_time[path] = modification_time;
					something_changed = true;
				}

				return nil;
			},
		);

		if something_changed {
			fmt.Println("change detected! running function!")
			if err := function_to_call(); err != nil {
				// this could just be "your go syntax is wrong" or something.
				fmt.Printf("got error when trying to run function, error:\n%v\n", err);
			} else {
				fmt.Println("finished running function!");
			}
		}

		// wait some time between checks.
		//
		// the better way to do this is os dependent.
		time.Sleep(250 * time.Millisecond);
	}

	// TODO handle Cntl-C, to stop this loop.
	return nil;
}

// this function never returns
func serve_personal_website() error {
	fmt.Println("serving personal website on port 8080");

	// serve all the files in this directory.
	fs := http.FileServer(http.Dir("./"));
	http.Handle("/", fs);

	// this will run forever?
	//
	// TODO figure out a way to kill this.
	return http.ListenAndServe(":8080", fs);
}

// this function never returns
func serve_and_hotreload_personal_website() error {

	if err := supply_wasm_exec_file(); err != nil {
		return fmt.Errorf("could not supply wasm_exec file, reason: %v", err);
	}

	if err := compile_boid_sim_to_wasm(); err != nil {
		return fmt.Errorf("could not compile boid sim to wasm, reason: %v", err);
	}

	// this error chanel is so that when something breaks, everything will shut down.
	error_chanel := make(chan error);

	go func() {
		error_chanel <- watch_go_files(BOID_SIM_GO_CODE_FOLDER, compile_boid_sim_to_wasm);
	}()
	go func() {
		error_chanel <- serve_personal_website();
	}()

	return <-error_chanel;
}



func check_for_error(err error, name string) {
	if err != nil {
		log.Fatalf("%s: %v\n", name, err);
	}
}
