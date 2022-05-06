const csv = require('csv-parser');
const fs = require('fs');

const clone = (obj) => {
    return JSON.parse(JSON.stringify(obj))
}

const replaceText = (selector, text) => {
    let element = document.getElementById(selector);
    if (element) element.innerText = text;
};

const getTArray = (count) => {
    let t_array = []
    for (let i = 1; i <= count; i++) {
        t_array.push(`team-${i}`);
    }
    return t_array
}

const students_csv_path = 'static/分隊.csv'
let students = {};
let team_names = null;
let team_count = 0;
let t_array = []
let students_backup = {};
let team_names_backup = [];
let team_count_backup = 0;
let loaded = false;

fs.createReadStream(students_csv_path)
    .pipe(csv())
    .on('data', (row) => {
        if (team_names === null) {
            team_names = Object.keys(row);
            team_count = team_names.length;
            t_array = getTArray(team_count);
        }
        team_names.forEach((team_name) => {
            if (!(team_name in students)) {
                students[team_name] = [row[team_name]];
            } else {
                students[team_name].push(row[team_name]);
            }
        });
    })
    .on('end', () => {
        console.log('CSV file successfully loaded');
        students_backup = clone(students);
        team_names_backup = team_names;
        team_count_backup = team_count;
        loaded = true;
    });


document.querySelector('#start-random').addEventListener('click', () => {
    if (!loaded) {
        alert('Wait a sec');
        return;
    }

    const remain_students = Object.values(students).map(elem => elem.length).reduce((a, b) => a + b, 0);
    if (Math.round(remain_students / t_array.length) === 0) {
        if (Object.values(students).every(t => t.length === 0)) {
            alert('所有隊伍皆抽取完畢');
        } else {
            alert(`還剩${students.length}位同學: ${students}`);
        }
        return;
    }

    for (let j = 0; j < t_array.length; j++) {
        const this_team_name = team_names[j];
        const this_team_students = students[this_team_name];
        let random_student_idx = Math.round(Math.random() * (this_team_students.length - 1))
        let random_student = students[this_team_name][random_student_idx];
        replaceText(t_array[j], random_student);
        this_team_students.splice(random_student_idx, 1);
    }
})

document.querySelector('#reset-random').addEventListener('click', () => {
    students = clone(students_backup);
    team_names = team_names_backup;
    team_count = team_count_backup;
    for (let j = 0; j < t_array.length; j++) {
        replaceText(t_array[j], team_names[j]);
    }
    alert('重設成功');
})
document.querySelector('#show-students').addEventListener('click', () => {
    const show_string = [];
    for (const [this_team_name, remain_students] of Object.entries(students)) {
        show_string.push(`${this_team_name}: ` + remain_students.join(" "));
    }
    alert(show_string.join("\n\n"));
})
