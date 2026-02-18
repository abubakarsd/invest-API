const User = require('../models/User');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { email, password, fullname, phone } = req.body;

        // Sanitize: allow only strings
        if ([email, password, fullname, phone].some(field => typeof field !== 'string')) {
            return res.status(400).json({ success: false, error: 'Invalid input data' });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        // Create user
        const user = await User.create({
            email,
            password,
            otp,
            otpExpires,
            profile: {
                fullname,
                phone
            }
        });

        console.log('================================================');
        console.log(`OTP for ${email}: ${otp}`); // Log OTP to console
        console.log('================================================');

        res.status(200).json({ success: true, data: { email, message: 'OTP sent to console' } });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Verify Email OTP
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        console.log('Verifying email:', { email, otp });

        const user = await User.findOne({
            email,
            otp,
            otpExpires: { $gt: Date.now() }
        });

        if (!user) {
            console.log('User not found or OTP invalid/expired');
            return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
        }

        // Verify user and clear OTP
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.error('Verify Email Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOtp = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ success: false, error: 'Email already verified' });
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        console.log('================================================');
        console.log(`Resend OTP for ${email}: ${otp}`);
        console.log('================================================');

        res.status(200).json({ success: true, data: { message: 'OTP resent to console' } });
    } catch (err) {
        console.error('Resend OTP Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Sanitize inputs
        if (typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ success: false, error: 'Invalid input format' });
        }

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide an email and password' });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({ success: true, data: {} });
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
    try {
        const fieldsToUpdate = {
            'profile.fullname': req.body.name, // Frontend sends 'name'
            'profile.phone': req.body.phone,
            'profile.phoneCode': req.body.phoneCountry, // Frontend sends 'phoneCountry'
            'profile.country': req.body.country,
            'profile.city': req.body.city,
            'profile.address': req.body.address,
            'profile.zipCode': req.body.zipCode,
            'profile.gender': req.body.gender,
            'profile.avatar': req.body.avatar
        };

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token,
            data: user // Send user data along with token
        });
};
