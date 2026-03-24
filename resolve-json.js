const fs = require('fs');
const { execSync } = require('child_process');

try {
  // --- Merge schools.json ---
  const headSchoolsText = execSync('git show HEAD:server/data/schools.json').toString();
  const mainSchoolsText = execSync('git show main:server/data/schools.json').toString();

  const headSchools = JSON.parse(headSchoolsText);
  const mainSchools = JSON.parse(mainSchoolsText);

  // Take the first school from main (has adminEmail, logo, etc.)
  // Take the second school from HEAD (Limitless Academy)
  const mergedSchools = {
    schools: [
      mainSchools.schools[0],
      ...(headSchools.schools[1] ? [headSchools.schools[1]] : [])
    ]
  };
  fs.writeFileSync('server/data/schools.json', JSON.stringify(mergedSchools, null, 2));
  console.log('Merged schools.json successfully.');

  // --- Merge staff-profiles.json ---
  const headStaffText = execSync('git show HEAD:server/data/staff-profiles.json').toString();
  const mainStaffText = execSync('git show main:server/data/staff-profiles.json').toString();

  const headStaff = JSON.parse(headStaffText);
  const mainStaff = JSON.parse(mainStaffText);

  // staff-profiles has a 'profiles' dictionary.
  // We want all profiles from both. If there's a conflict, main wins.
  const mergedStaff = {
    profiles: {
      ...headStaff.profiles,
      ...mainStaff.profiles
    }
  };
  fs.writeFileSync('server/data/staff-profiles.json', JSON.stringify(mergedStaff, null, 2));
  console.log('Merged staff-profiles.json successfully.');

} catch (error) {
  console.error('Error during merge:', error);
}
