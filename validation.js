const isValidDate = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    const date = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDifference = today.getMonth() - date.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < date.getDate())) {
        age--;
    }

    return age >= 18;
};

const validateForm = (req, res, next) => {
    const { username, email, password, address, contact, dateOfBirth } = req.body;

    // Server-side validation
    if (!username || !email || !password || !address || !contact || !dateOfBirth) {
        req.flash('error', 'All fields are required.');
        return res.redirect('/register');
    }

    // Username validation
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
        req.flash('error', 'Invalid username. It should be 3-20 characters long and can contain alphanumeric characters and underscores.');
        return res.redirect('/register');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        req.flash('error', 'Invalid email address.');
        return res.redirect('/register');
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        req.flash('error', 'Invalid password. It must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.');
        return res.redirect('/register');
    }

    // Contact number validation
    if (contact.length !== 10 || !/^\d+$/.test(contact)) {
        req.flash('error', 'Invalid contact number.');
        return res.redirect('/register');
    }

    // Date of Birth validation
    if (!isValidDate(dateOfBirth)) {
        req.flash('error', 'Invalid date of birth. You must be at least 18 years old.');
        return res.redirect('/register');
    }

    next();
};

module.exports = { validateRegistration };
