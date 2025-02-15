

class Shell
{
    constructor()
    {
        this.stop_this_process;
        this.open_new_process;
        this.utils = ["custdb"];

        this.process_name = "shell";
        this.info = "It's a lil programm for hosting lil services. Available commands: \n - help \t-\t use for info \n - custdb \t-\t open web database manager\n";
    };


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


    run(output, stop_curr_process, open_process)
    {
        output("Starting shell...");

        this.stop_this_process = stop_curr_process;
        this.open_new_process = open_process;
    }


    exec(args, output, set_context)
    {
        if (args === "close")
            close();
        else if (args === "help")
        {
            output(this.info);
            return;
        }

        let tokenided_command = args.split(' ');

        if (this.utils.includes(tokenided_command[0]))
        {
            this.open_new_process(tokenided_command[0]);
        }
        else
        {
            if (args.length > 0)
                output("Command '" + tokenided_command[0] + "' is not found!\n");
        }
    }


    interrupt(output)
    {
        output("Interrupting " + this.process_name);
    }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const process_shell = new Shell();
