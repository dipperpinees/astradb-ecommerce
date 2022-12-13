import bcrypt from 'bcryptjs';
const Users = [
    {
        name: 'Admin',
        email: 'admin@gmail.com',
        password: bcrypt.hashSync('admin', 12),
        isAdmin: true,
    },
    {
        name: 'Hiep Nguyen',
        email: 'hiepnk@gmail.com',
        password: bcrypt.hashSync('123456', 12),
        isAdmin: false,
    },
];
export default Users;
