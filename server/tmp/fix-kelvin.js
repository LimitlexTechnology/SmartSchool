
const fs = require('fs');
const path = require('path');

const studentFile = 'c:/Users/kobby/OneDrive/Documentos/GitHub/SmartSchool/server/data/tenants/e5b5e855-f73a-44e9-ae0c-a18e5cc87b0f/students.json';
const targetClassId = 'c89b745d-0fb8-4a06-9715-5d0e7a238f8b';

try {
    const data = JSON.parse(fs.readFileSync(studentFile, 'utf8'));
    const kelvin = data.students.find(s => s.firstName === 'Kelvin' && s.lastName === 'Quansah');
    if (kelvin) {
        kelvin.classId = targetClassId;
        fs.writeFileSync(studentFile, JSON.stringify(data, null, 2));
        console.log('Successfully updated Kelvin\'s classId.');
    } else {
        console.log('Kelvin not found in student list.');
    }
} catch (e) {
    console.error('Error:', e.message);
}
