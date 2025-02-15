
// import { process_list } from "./process_list.js";

const frame = document.getElementById("root")
var editable = true;

var process_stack = [];

var command_pointer = 0;
var command_history = [];
var command = "";

var context_is_on = true;


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Высокий уровень интерфейса


function output(msg)
{
    frame.value += msg + "\n";
}

function show_context()
{
    if (context_is_on)
    {
        frame.value += "chrome@" + process_stack.join(">") + "> ";
    }
    else
    {
        frame.value += "> ";
    }

    frame.setSelectionRange(frame.value.length, frame.value.length);
    frame.scrollTop = frame.scrollHeight;
}

function set_context(val)
{
    context_is_on = val;
}


function close_process(process_name)
{
    if (process_name !== process_stack[process_stack.length - 1])
    {
        output("PROCESS CONFLICT!\nProcess stack: ");
        output(process_stack.toString() + "\n");
        output("Try to close '" + process_name + "'\n");
        output("Interrupting until shell process...");

        interrupt_process(process_stack[1]);
    }
    else 
    {
        process_list[process_stack.pop()];
    }
}

function open_process(process_name) 
{ 
    process_stack.push(process_name);
    process_list[process_name].run(
        output, 
        () => { close_process(process_name); }, 
        open_process
    );
}


function interrupt_process(process_name) 
{ 
    for (let index = 0; index < process_stack.length; index++) {
        const element = process_stack[index];

        if (element === process_name)
        {
            for(let jndex = process_stack.length - 1; jndex >= index; jndex--)
                process_list[process_stack[jndex]].interrupt(output);

            process_stack = process_stack.slice(0, index);

            break;
        }
    }
}


function save_command()
{
    if (command_history.length === 0 || command_history[command_history.length - 1] !== command)
        command_history.push(command);

    if (command_history.length > 10)
    {
        command_history = command_history.slice(command_history.length - 10);
    }

    command_pointer = 0;
}


function send_comand()
{
    output('\n');
    process_list[process_stack[process_stack.length - 1]].exec(command, output, set_context)
    show_context();
    command = "";
}


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Событийный интерфейс

function onAwake()
{
    if (localStorage.getItem("command_history") !== null)
        command_history = JSON.parse(localStorage["command_history"])

    frame.focus();

    open_process("shell");
    show_context();
}

function onBackspace(event)
{
    frame.setSelectionRange(frame.value.length, frame.value.length);
    if (command.length > 0)
    {
        command = command.slice(0, command.length - 1);
        frame.value = frame.value.slice(0, frame.value.length - 1);
    }

}

function onInput(event)
{
    command += frame.value[frame.value.length - 1];
}

function onEnter()
{
    editable = false;

    save_command();

    send_comand();

    editable = true;
}


function onArrowUp()
{
    command_pointer++;

    let command_index = command_history.length - command_pointer;

    if (command_index >= 0)
    {
        frame.value = frame.value.slice(0, frame.value.length - command.length);
        command = command_history[command_index];
        frame.value += command;
    }
    else 
    {
        command_pointer = command_history.length;
    }
    
}

function onArrowDown()
{
    command_pointer--;

    let command_index = command_history.length - command_pointer;

    if (command_index < command_history.length)
    {
        frame.value = frame.value.slice(0, frame.value.length - command.length);
        command = command_history[command_index];
        frame.value += command;
    }
    else if (command_pointer === 0)
    {
        frame.value = frame.value.slice(0, frame.value.length - command.length);
        command = "";
        frame.value += command;
    }
    else 
    {
        command_pointer = 0;
        frame.value = frame.value.slice(0, frame.value.length - command.length);
        command = "";
    }
}

function onDestroy()
{
    localStorage["command_history"] = JSON.stringify(command_history);
}

function onInterrupt()
{
    if (process_stack.length >= 2)
    {
        interrupt_process(process_stack[process_stack.length - 1]);
        set_context(true);
        show_context();
    }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Привязка событий

onAwake();

frame.addEventListener("input", onInput);

frame.addEventListener("keydown", function(event)
{
    frame.setSelectionRange(frame.value.length, frame.value.length);

    if (event.key === "ArrowUp")
    {
        event.preventDefault();
        onArrowUp();
    }
    else if (event.key === "ArrowDown")
    {
        event.preventDefault();
        onArrowDown();
    }
    else if (event.key === "Backspace" || event.key === "Delete")
    {
        event.preventDefault();
        onBackspace(event);
    }
    else if (event.key === "c" && event.ctrlKey)
        onInterrupt();
})

frame.addEventListener("keypress", function(event) {

    if (!editable)
    {
        event.preventDefault();
        return;
    }

    if (event.key === "Enter") 
    {
        event.preventDefault();
        onEnter();
    }
    
    
});

window.onbeforeunload = function(event)
{
    onDestroy();
    return;
};