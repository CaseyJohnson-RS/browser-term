
let columns = [
    ["Фамилия", "Строка", (str) => { return str.length >= 2 && str.length <= 32; }],
    ["Имя", "Строка", (str) => { return str.length >= 2 && str.length <= 16; }],
    ["Отчество", "Строка", (str) => { return str.length >= 2 && str.length <= 24; }],
    ["Пол", "Логический", (str) => { return str === "М" || str === "Ж"; }],
    ["Нациоальность", "Строка", (str) => { return str.length >= 2 && str.length <= 24; }],
    ["Рост", "Числовой", (str) => { return !isNaN(parseFloat(str)) && parseFloat(str) > 0 && parseFloat(str) < 500; }],
    ["Вес", "Числовой", (str) => { return !isNaN(parseFloat(str)) && parseFloat(str) > 0 && parseFloat(str) < 500; }],
    ["Дата рождения (ГГГГ/ММ/ДД)", "Дата", (str) => { return /([0-9]){4}\/([0-9]){2}\/([0-9]){2}$/im.test(str); }],
    ["Номер телефона", "Строка", (str) => { return /^(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}$/.test(str); }],
    ["Домашний адрес", "Строка", (str) => { return str.length >= 0 && str.length <= 128; }],
    ["Номер кредитной каточки", "Строка", (str) => { return str.length === 16 && /([0-9]){16}$/im.test(str); }],
    ["Номер банковского счёта", "Строка", (str) => { return str.length === 20 && /([0-9]){20}$/im.test(str); }],
]

let DB = [];

function saveDB()
{
    localStorage["DB"] = JSON.stringify(DB);
}

function loadDB()
{
    if (localStorage.getItem("DB") !== null)
        DB = JSON.parse(localStorage["DB"]);
}

class CustDB {
    constructor() {
        this.stop_this_process;
        this.open_new_process;
        this.utils = [];

        this.process_name = "custdb";
        this.info = 
        "Local database service. Commands: \
        \n - exit \t\t\t\t\t\t\t\t - close manager \
        \n - table [cols | columns] \t\t\t\t\t\t - get info about columns \
        \n -       [--show | -s] \t\t\t\t\t\t\t - show table \
        \n -       [--insert | -i [<record_amount>]] \t\t\t\t - insert into table one (by default) of several records \
        \n -       [--insert | -i [--condition | -c <col_num> <col_value>]] \t - insert into table until value in specified column becomes <col_value> \
        \n -       [--edit | -e [<row_idx> <col_num> <value>] ] \t\t\t - insert into record with <row_idx> in column with <col_num> validated <value> \
        \n -       [--found | -f <col_num> <col_value> ] \t\t\t\t - shows records by filter \
        \n -       [sort <col_num> [--desc | -d] ] \t\t\t\t - sort table by solumn \
        \n -       [save] \t\t\t\t\t\t\t - saves table \
        \n -       [load] \t\t\t\t\t\t\t - loads table \ ";

        this.state = "";
        this.input_range = -1;
        this.cond_column = -1;
        this.cond_value = "";
        this.inputs_skiped = 0;
        this.current_col = 1;
        this.current_record = [];

        this.DB_row_index = -1;
        this.DB_col_num = -1;
    };

    elipsis = (str, len) => {
        if (str.length <= len) {
            for (let i = str.length; i < len; ++i)
                str += ' '
            return str;
        }
        else {
            return str.slice(0, len - 4) + "... ";
        }
    }

    get_cols_names = () => {
        let line = "#  ";

        for (let index = 0; index < columns.length; index++)
            line += columns[index][0] + "      ";

        return line;
    }

    state_zero = () => {
        this.state = "";
        this.input_range = -1;
        this.cond_column = -1;
        this.cond_value = "";
        this.inputs_skiped = 0;
        this.current_col = 1;
        this.current_record = [];
    }

    check_field = (num, str) => { return columns[num - 1][2](str); }

    enter_record = (args, output, set_context) => {
        if (this.input_range > this.inputs_skiped) {

            if (this.check_field(this.current_col, args)) {
                this.current_record.push(args);
                this.current_col++;

                if (this.current_col > columns.length) {
                    this.current_col = 1;
                    this.inputs_skiped++;
                    DB.push(this.current_record);
                    this.current_record = [];

                    if (this.input_range === this.inputs_skiped) {
                        this.state_zero();
                        set_context(true);
                        return;
                    }
                    else {
                        output("Следующая запись")
                    }
                }
            }
            else {
                output("Поле невалидно!")
                return;
            }
        }
        else if (this.cond_value.length > 0) {
            if (this.check_field(this.current_col, args)) {
                if (this.cond_column === this.current_col && args === this.cond_value) {
                    this.cond_column = -1;
                }

                this.current_record.push(args);
                this.current_col++;

                if (this.current_col > columns.length) {
                    this.current_col = 1;
                    DB.push(this.current_record);
                    this.current_record = [];

                    if (this.cond_column === -1) {
                        this.state_zero();
                        set_context(true);
                        return;
                    }
                    else {
                        output("Следующая запись")
                    }
                }
            }
            else {
                output("Поле невалидно!")
                return;
            }
        }

        output(columns[this.current_col - 1][0]);
    }

    choose_row = (args, output, set_context) => {

        let index = parseInt(args);

        if (isNaN(index) || index < 0 || index >= DB.length)
        {
            output("Incorrect value!");
            return;
        }

        this.DB_row_index = index;

        let line = "";

        line = this.elipsis(this.DB_row_index.toString(), 3);
        for (let ri = 0; ri < DB[this.DB_row_index].length; ri++)
            line += this.elipsis(DB[this.DB_row_index][ri], columns[ri][0].length + 6);

        output(line);
        output("Введите номер колонки, которую хотите изменить: ");

        this.DB_row_index = index;
        this.state = "choose_col";
    }

    choose_col = (args, output, set_context) => {

        let num = parseInt(args);

        if (isNaN(num) || num <= 0 || num > columns.length)
        {
            output("Incorrect value!");
            return;
        }

        output("Введите значение: ");

        this.state = "edit_col";
        this.DB_col_num = num;
    }

    edit_col = (args, output, set_context) => {

        if (!this.check_field(this.DB_col_num, args))
        {
            output("Incorrect value!");
            return;
        }

        output("Значение успешно изменено!");
        set_context(true);

        DB[this.DB_row_index][this.DB_col_num - 1] = args;

        this.state_zero();
    }


    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


    run(output, stop_curr_process, open_process) {
        this.stop_this_process = stop_curr_process;
        this.open_new_process = open_process;

        loadDB();
    }


    exec(args, output, set_context) {

        if (args === "help")
        {
            output(this.info);
            return;
        }

        if (this.state === "input") 
        {
            this.enter_record(args, output, set_context);
            return;
        }

        if (this.state === "choose_row")
        {
            this.choose_row(args, output, set_context);
            return;
        }

        if (this.state === "choose_col")
        {
            this.choose_col(args, output, set_context);
            return;
        }

        if (this.state === "edit_col")
        {
            this.edit_col(args, output, set_context);
            return;
        }

        let tokenided_command = args.split(' ');

        if (tokenided_command[0] === "exit") {
            output("Пакак...");
            saveDB();
            this.stop_this_process();
            return;
        }

        if (tokenided_command[0] === "table") {

            if (tokenided_command.length >= 2 && (tokenided_command[1] === "cols" || tokenided_command[1] === "columns")) {

                for (let index = 0; index < columns.length; index++) {
                    const column = columns[index];

                    output("Колонка " + (index + 1));
                    output("Заголовок: " + column[0]);
                    output("Тип: " + column[1] + '\n');

                }

                return;

            }
            else if (tokenided_command.length >= 2 && (tokenided_command[1] === "-s" || tokenided_command[1] === "--show")) {
                output(this.get_cols_names());

                let line = "";

                for (let index = 0; index < DB.length; index++) {
                    line = this.elipsis(index.toString(), 3);
                    for (let ri = 0; ri < DB[index].length; ri++)
                        line += this.elipsis(DB[index][ri], columns[ri][0].length + 6);

                    output(line);
                }

                return;
            }
            else if (tokenided_command.length >= 2 && (tokenided_command[1] === "-i" || tokenided_command[1] === "--insert")) 
                {
                if (tokenided_command.length >= 3) {
                    if (tokenided_command[2] === '-c' || tokenided_command[2] === '--condition') {
                        if (tokenided_command.length === 5) {
                            let col_num = parseInt(tokenided_command[3]);
                            if (!isNaN(col_num) && col_num > 0 && col_num <= columns.length) {
                                if (columns[col_num - 1][2](tokenided_command[4])) {

                                    output("Ввод данных будет продолжаться до тех пор, пока поле '" + columns[col_num - 1][0] + "' не станет равно '" + tokenided_command[4] + "'");
                                    output("Вводите данные колонок по отдельности (через Enter).");
                                    output(this.get_cols_names());

                                    output(columns[0][0])

                                    this.state = "input";
                                    this.cond_column = col_num;
                                    this.current_col = 1;
                                    this.cond_value = tokenided_command[4];
                                    this.current_record = [];

                                    set_context(false);

                                    return;
                                }
                            }
                        }
                    }
                    else {
                        let iters = parseInt(tokenided_command[2]);
                        if (!isNaN(iters)) {
                            output("Ввод данных будет продолжаться до тех пор, пока не будет введено " + iters + " полных записи(ей)");
                            output("Вводите данные колонок по отдельности (через Enter).");
                            output(this.get_cols_names());

                            output(columns[0][0])

                            this.state = "input";
                            this.input_range = iters;
                            this.inputs_skiped = 0;
                            this.current_col = 1;
                            this.current_record = [];

                            set_context(false);

                            return;
                        }
                    }

                    output("Wrong command flags!");
                    return;
                }

                output("Вводите данные колонок по отдельности (через Enter).");
                output(this.get_cols_names());

                output(columns[0][0])

                this.state = "input";
                this.input_range = 1;
                this.inputs_skiped = 0;
                this.current_col = 1;
                this.current_record = [];

                set_context(false);

            }
            else if (tokenided_command.length >= 2 && (tokenided_command[1] === "-e" || tokenided_command[1] === "--edit")) {

                if (tokenided_command.length === 5)
                {
                    let ridx = parseInt(tokenided_command[2]);
                    let cnum = parseInt(tokenided_command[3]);

                    if (!isNaN(ridx) && !isNaN(cnum) && ridx >= 0 && ridx < DB.length && cnum > 0 && cnum <= columns.length && this.check_field(cnum, tokenided_command[4]))
                    {
                        DB[ridx][cnum - 1] = tokenided_command[4];
                        output("Значение успешно изменено!");
                        return;
                    }
                    else 
                    {
                        output("Incorrect command!");
                        return;
                    }


                }

                this.state = "choose_row";
                output("Введите номер: ");
                set_context(false);
            }
            else if (tokenided_command.length === 4 && (tokenided_command[1] === "-f" || tokenided_command[1] === "--found"))
            {
                let cnum = parseInt(tokenided_command[2]);


                if (!isNaN(cnum) && cnum > 0 && cnum <= columns.length && this.check_field(cnum, tokenided_command[3]))
                {
                    
                    let check = false;

                    for(let i = 0; i < DB.length; i++)
                    {
                        if (DB[i][cnum - 1] === tokenided_command[3])
                        {  
                            output("Найдены совпадения!");
                            
                            let line = "";

                            line = this.elipsis(i.toString(), 3);
                            for (let ri = 0; ri < DB[i].length; ri++)
                                line += this.elipsis(DB[i][ri], columns[ri][0].length + 6);
        
                            output(line);

                            check = true;

                        }
                    }

                    if (!check)
                        output("Совпадений не найдено!")
                    return;
                }
                else 
                {
                    output("Incorrect command!");
                    return;
                }
            }
            else if (tokenided_command.length <= 4 && (tokenided_command[1] === "sort"))
            {   
                let cnum = parseInt(tokenided_command[2]);

                for(let i = 0; i < columns.length; ++i)
                {
                    if(columns[i][0] === tokenided_command[2])
                    {
                        cnum = i + 1;
                        break;
                    }
                }

                if (!isNaN(cnum) && cnum > 0 && cnum <= columns.length)
                {
                    if (tokenided_command.length === 4)
                    {
                        if (tokenided_command[3] === "-d" || tokenided_command[3] === "--desc")
                            DB.sort( (l, r) => (l[cnum - 1] < r[cnum - 1] ? -1 : 1)  );
                        else
                        {
                            output("Wrong sort atributes!");
                            return;
                        }
                    }
                    else
                        DB.sort( (l, r) => (l[cnum - 1] > r[cnum - 1] ? -1 : 1) );

                    console.log(DB.sort((l, r) => l[cnum - 1] > r[cnum - 1]));
                    

                    output("Sorted!")
                    return;
                }
                else 
                {
                    output("Incorrect command!");
                    return;
                }
            }
            else if (tokenided_command.length >= 2 && tokenided_command[1] === "save")
            {   
                saveDB();
                output("Saved!");
            }
            else if (tokenided_command.length >= 2 && tokenided_command[1] === "load")
            {   
                loadDB();
                output("Loaded!");
            }
            else
                output("Incorrect command!");

            return;

        }

        if (this.utils.includes(tokenided_command[0])) {
            this.open_new_process(tokenided_command[0]);
        }
        else {
            if (command.length > 0)
                output("Command '" + tokenided_command[0] + "' is not found!\n");
        }
    }


    interrupt(output) {
        output("Interrupting " + this.process_name);
        saveDB();
        this.state_zero();
    }
}


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


const process_custdb = new CustDB();