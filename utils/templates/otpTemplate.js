const otpTemplate = (otp) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f7f9;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
        .header {
            background-color: #1a73e8;
            color: white;
            padding: 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 30px;
            text-align: center;
        }
        .otp-code {
            display: inline-block;
            margin: 20px 0;
            padding: 15px 30px;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            color: #1a73e8;
            background-color: #e8f0fe;
            border-radius: 4px;
            border: 1px dashed #1a73e8;
        }
        .footer {
            background-color: #f8f9fa;
            color: #777;
            padding: 20px;
            text-align: center;
            font-size: 12px;
        }
        .footer p {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Email Verification</h1>
        </div>
        <div class="content">
            <p>Thank you for choosing <strong>CopyTradeHome</strong>. Please use the following One-Time Password (OTP) to verify your email address:</p>
            <div class="otp-code">${otp}</div>
            <p>This code is valid for 10 minutes. If you did not request this verification, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} CopyTradeHome. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
        </div>
    </div>
</body>
</html>
    `;
};

module.exports = otpTemplate;
