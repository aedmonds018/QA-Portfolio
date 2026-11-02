const users = [
    { name: "Alex", age: 25, active: true },
    { name: "Sarah", age: 34, active: false },
    { name: "Mike", age: 19, active: true },
    { name: "Jessica", age: 42, active: true }
];

const names = users
    .filter(function(user) {
     return user.active === true && user.age >= 30;
    })
    .map(function(user) {
        return user.name
    });
