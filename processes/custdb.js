
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

let DB = [["Груша","Яблоко","Банан","Ж","Оващ","1","2","2021/12/21","88005553535","Дерева","2398239823984294","18492652747592754830"],["Книга","Анна","Каренина","Ж","Лев","500","150","0002/05/12","839121294","ул. Пушкина 1, кв. 5","7777777777777772","10101010101010100102"],["Ноутбук","Елена","Иванова","Ж","Андрей","800","150","0990/03/03","8234823423896","г. Екатеринбург, ул. Пушкина 3","0141958394829350","01419583948293482454"],["Смартфон","Анастасия","Соколова","Ж","Владимир","700","120","1995/10/05","87777777779","г. Казань, ул. Советская 4","0000000000000002","00000000000000000002"],["Стакан","Юлий","Гагарин","Ж","Инопланетянин","2","300","0010/01/09","89620352511","Земля матушка","1234123412341234","12345678912345678912"],["Телефон","Мария","Петрова","Ж","Сергей","500","100","0012/03/11","89620352513","г. Санкт-Петербург, ул. Невского 2","1234123412341236","12345678912345678914"],["Яблоко","Груша","Овощ","Ж","Фрукт","3","4","2022/11/22","88005553536","Сад","2398239823984295","18492652747592754831"],["Автомобиль","Дмитрий","Кузнецов","М","Олег","50000","10000","0013/04/12","88005553537","г. Новосибирск, ул. Ленина 3","2398239823984296","18492652747592754832"],["Коврик","Михлил","Азотовиь","М","Курилл","300","120","0001/03/08","839121293","ул. Коробки 17, корп. 101, ква","7777777777777771","10101010101010100101"],["Компьютер","Алексей","Смирнов","М","Иван ","200","200","0003/04/15","839121295","ул. Гагарина 2, кв. 6","7777777777777773","10101010101010100103"],["Нечто","Энергос","Подиков-Жишькин","М","!!!!ьь:0","100","80","1993/11/03","87777777777","г.Город, ул. Улица","0000000000000000","00000000000000000000"],["Пельмень","Пельмени","Пельменьичъ","М","YY","499","43","0988/01/01","8234823423894","БОМЖ","0141958394829348","01419583948293482452"],["Пицца","Пиццы","Пиццевич","М","XX","599","53","0989/02/02","8234823423895","Ресторан","0141958394829349","01419583948293482453"],["Чайник","Иван","Иванов","М","Петр","100","200","0011/02/10","89620352512","г. Москва, ул. Ленина 1","1234123412341235","12345678912345678913"],["Чудовище","Энергос","Подиков-Жишькин","М","!!!!ьь:1","1.1","90","1994/12/04","87777777778","г. Город, ул. Улица 2","0000000000000001","00000000000000000001"],["Шамухаметов","Руслан","Камилевич","М","Русский","170","60","2004/03/03","89620352511","г.Омск, ул. Энтузиастов 67Б, кв. 1","9385829378293602","94625813769236475962"]];

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